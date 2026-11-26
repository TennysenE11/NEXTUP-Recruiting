// OpenSpot billing server logic. src/index.js is the Cloudflare Worker entry that calls handle().
// The app is a static page with no accounts, so this small server does the parts that need a
// Stripe key: start Checkout, hand back a license key, check a subscription, open the Customer
// Portal, and act on Stripe's webhook events. Stripe is the only record of who has paid, so
// nothing is stored here.
//
// Routes (all POST, JSON in and out):
//   /checkout  { cycle: "monthly" | "yearly", return_to }  -> { id, url }
//   /claim     { session_id }                              -> { key, active, status, ... }
//   /status    { key }                                     -> { key, active, status, ... }
//   /portal    { key, return_to }                          -> { url }
//   /webhook   Stripe events, checked against STRIPE_WEBHOOK_SECRET
import Stripe from "stripe";
import { makeKey, readKey } from "./license.js";

export const API_VERSION = "2026-11-18.endive";
export const LOOKUP = { monthly: "openspot_pro_monthly", yearly: "openspot_pro_yearly" };
const TRIAL_DAYS = 21;
const GRACE_DAYS = 3; // offline grace after a period ends, while Stripe retries a card
const ENTITLED = new Set(["trialing", "active", "past_due"]);
// Tags these sessions in the Stripe Dashboard so this checkout flow can be compared with others.
const INTEGRATION_ID = "openspot_pro_trial_qzmvkhtr";

export function makeStripe(env) {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: API_VERSION,
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
    appInfo: { name: "OpenSpot Billing" },
  });
}
const cryptoProvider = Stripe.createSubtleCryptoProvider();

class UserError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status || 400;
  }
}

export async function handle(request, env, deps) {
  const url = new URL(request.url);
  const cors = corsHeaders(request.headers.get("Origin"), env);
  if (request.method === "OPTIONS") return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
  if (request.method !== "POST") return json({ error: "Use POST." }, 405, cors);
  try {
    if (url.pathname === "/webhook") return await webhook(request, env, deps);
    if (!cors) return json({ error: "Origin not allowed." }, 403);
    const body = await request.json().catch(() => ({}));
    if (url.pathname === "/checkout") return json(await checkout(body, env, deps), 200, cors);
    if (url.pathname === "/claim") return json(await claim(body, env, deps), 200, cors);
    if (url.pathname === "/status") return json(await status(body, env, deps), 200, cors);
    if (url.pathname === "/portal") return json(await portal(body, env, deps), 200, cors);
    return json({ error: "Not found." }, 404, cors);
  } catch (err) {
    if (err instanceof UserError) return json({ error: err.message }, err.status, cors);
    if (err && err.code === "resource_missing") return json({ error: "We couldn't find that subscription." }, 404, cors);
    console.error("billing error", url.pathname, err && err.type, err && err.code, err && err.message);
    return json({ error: "Billing is having trouble. Try again in a minute." }, 500, cors);
  }
}

// ---------- routes ----------

async function checkout(body, env, { stripe }) {
  const cycle = body.cycle === "monthly" ? "monthly" : "yearly";
  const price = await priceFor(stripe, cycle);
  const back = returnUrl(body, env);
  const params = {
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    subscription_data: { trial_period_days: TRIAL_DAYS },
    allow_promotion_codes: true,
    custom_text: { submit: { message: "No charge for 21 days. Cancel anytime in the app before your trial ends." } },
    success_url: back + "?checkout=done&session_id={CHECKOUT_SESSION_ID}",
    cancel_url: back + "?checkout=canceled",
    integration_identifier: INTEGRATION_ID,
  };
  // Stripe Tax collects nothing until the account has an active registration. See billing/README.md.
  if (env.AUTOMATIC_TAX === "true") params.automatic_tax = { enabled: true };
  const session = await stripe.checkout.sessions.create(params);
  return { id: session.id, url: session.url };
}

async function claim(body, env, { stripe }) {
  const id = String(body.session_id || "");
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) throw new UserError("That checkout link isn't valid.");
  const s = await stripe.checkout.sessions.retrieve(id, { expand: ["subscription"] });
  if (s.mode !== "subscription") throw new UserError("That checkout isn't for Pro.");
  // Trials finish with payment_status "no_payment_required"; only "unpaid" means no access yet.
  // The subscription is attached only once the session is complete.
  if (s.status !== "complete" || s.payment_status === "unpaid" || !s.subscription) return { active: false, status: s.status === "expired" ? "expired" : "open" };
  const sub = typeof s.subscription === "string" ? await stripe.subscriptions.retrieve(s.subscription) : s.subscription;
  return { key: await makeKey(sub.id, env.LICENSE_SECRET), ...summarize(sub) };
}

async function status(body, env, { stripe }) {
  const subId = await readKey(body.key, env.LICENSE_SECRET);
  if (!subId) throw new UserError("That license key isn't valid.");
  const sub = await stripe.subscriptions.retrieve(subId);
  return { key: String(body.key).trim(), ...summarize(sub) };
}

async function portal(body, env, { stripe }) {
  const subId = await readKey(body.key, env.LICENSE_SECRET);
  if (!subId) throw new UserError("That license key isn't valid.");
  const sub = await stripe.subscriptions.retrieve(subId);
  const params = { customer: idOf(sub.customer), return_url: returnUrl(body, env) };
  const config = await portalConfig(stripe);
  if (config) params.configuration = config;
  const s = await stripe.billingPortal.sessions.create(params);
  return { url: s.url };
}

// What the app needs to know about a subscription. Times are in milliseconds.
export function summarize(sub) {
  const item = sub.items && sub.items.data && sub.items.data[0];
  const end = item ? item.current_period_end : 0; // on the item since API version 2025-03-31
  const active = ENTITLED.has(sub.status);
  const price = (item && item.price) || {};
  const cycle = price.lookup_key === LOOKUP.monthly || (price.recurring && price.recurring.interval === "month") ? "monthly" : "yearly";
  return {
    active,
    status: sub.status,
    cycle,
    trial_end: sub.trial_end ? sub.trial_end * 1000 : null,
    period_end: end ? end * 1000 : null,
    renews: active && !sub.cancel_at_period_end && !sub.cancel_at,
    until: active && end ? (end + GRACE_DAYS * 86400) * 1000 : 0,
  };
}

// ---------- webhooks ----------

async function webhook(request, env, { stripe }) {
  const raw = await request.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider);
  } catch (err) {
    return new Response("Bad signature", { status: 400 });
  }
  try {
    await onEvent(event, stripe);
  } catch (err) {
    // An object that no longer exists won't appear on a retry, so don't ask Stripe to retry.
    if (err && err.code === "resource_missing") {
      log("webhook object missing", { event: event.id, type: event.type });
      return json({ received: true });
    }
    throw err; // returns 500, and Stripe retries the event
  }
  return json({ received: true });
}

// Access is read live from the subscription on every /status call, so lifecycle events need no
// bookkeeping here. Risk events end access by canceling the subscription in Stripe.
export async function onEvent(event, stripe) {
  const o = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (o.mode === "subscription" && o.payment_status !== "unpaid") log("pro started", { session: o.id, subscription: idOf(o.subscription) });
      return "logged";
    case "checkout.session.async_payment_failed":
      log("checkout payment failed", { session: o.id });
      return "logged";
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      log(event.type, { subscription: o.id, status: o.status });
      return "logged";
    case "invoice.paid":
    case "invoice.payment_failed":
      log(event.type, { invoice: o.id, subscription: idOf(o.parent && o.parent.subscription_details && o.parent.subscription_details.subscription) });
      return "logged";
    case "charge.dispute.created":
      return endAccess(stripe, await subscriptionForCharge(stripe, o.charge), "dispute " + o.id);
    case "radar.early_fraud_warning.created": {
      const charge = typeof o.charge === "string" ? await stripe.charges.retrieve(o.charge) : o.charge;
      // Refunding a charge with a fraud warning heads off a dispute and its fee.
      if (o.actionable && !charge.refunded) {
        await stripe.refunds.create({ charge: charge.id, reason: "fraudulent" }, { idempotencyKey: "efw-refund-" + o.id });
      }
      return endAccess(stripe, await subscriptionForCharge(stripe, charge), "fraud warning " + o.id);
    }
    case "charge.refunded":
      if (o.refunded) return endAccess(stripe, await subscriptionForCharge(stripe, o), "full refund " + o.id);
      return "partial refund";
  }
  return "ignored";
}

// Charge -> PaymentIntent -> InvoicePayment -> Invoice -> Subscription (API version 2025-03-31 and later).
export async function subscriptionForCharge(stripe, chargeOrId) {
  if (!chargeOrId) return null;
  const charge = typeof chargeOrId === "string" ? await stripe.charges.retrieve(chargeOrId) : chargeOrId;
  const pi = idOf(charge.payment_intent);
  if (!pi) return null;
  const payments = await stripe.invoicePayments.list({ payment: { type: "payment_intent", payment_intent: pi }, limit: 1 });
  const inv = payments.data[0] && payments.data[0].invoice;
  if (!inv) return null;
  const invoice = typeof inv === "string" ? await stripe.invoices.retrieve(inv) : inv;
  const details = invoice.parent && invoice.parent.subscription_details;
  return details ? idOf(details.subscription) : null;
}

async function endAccess(stripe, subId, why) {
  if (!subId) {
    log("no subscription found", { why });
    return "no subscription";
  }
  const sub = await stripe.subscriptions.retrieve(subId);
  if (sub.status === "canceled" || sub.status === "incomplete_expired") return "already ended";
  await stripe.subscriptions.cancel(subId, {}, { idempotencyKey: "end-" + subId });
  log("pro ended", { subscription: subId, why });
  return "canceled";
}

// ---------- helpers ----------

const priceCache = new Map();
async function priceFor(stripe, cycle) {
  if (priceCache.has(cycle)) return priceCache.get(cycle);
  const list = await stripe.prices.list({ lookup_keys: [LOOKUP[cycle]], active: true, limit: 1 });
  if (!list.data.length) throw new Error("No active price with lookup key " + LOOKUP[cycle] + ". Run scripts/setup-catalog.mjs.");
  priceCache.set(cycle, list.data[0].id);
  return list.data[0].id;
}

// The portal configuration made by scripts/setup-catalog.mjs, if there is one.
let portalConfigId;
async function portalConfig(stripe) {
  if (portalConfigId !== undefined) return portalConfigId;
  try {
    const list = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
    const mine = list.data.find((c) => c.metadata && c.metadata.app === "openspot");
    portalConfigId = mine ? mine.id : null;
  } catch (err) {
    portalConfigId = null;
  }
  return portalConfigId;
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function corsHeaders(origin, env) {
  if (!origin || !allowedOrigins(env).includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// Send people back to the page they came from, but only on an allowed origin.
function returnUrl(body, env) {
  try {
    const u = new URL(body.return_to);
    if (allowedOrigins(env).includes(u.origin)) return u.origin + u.pathname;
  } catch (err) {
    // fall through
  }
  return env.APP_URL;
}

function idOf(x) {
  return !x ? null : typeof x === "string" ? x : x.id || null;
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json", ...(headers || {}) } });
}

function log(what, data) {
  console.log(JSON.stringify({ at: new Date().toISOString(), what, ...data }));
}
