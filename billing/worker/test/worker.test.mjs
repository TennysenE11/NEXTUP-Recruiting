// Tests for the billing server. Stripe's API is replaced by a small fake; webhook signatures use
// the real Stripe SDK so a bad signature fails exactly as it would in production.
import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { handle, summarize } from "../src/billing.js";
import { makeKey, readKey } from "../src/license.js";

const real = new Stripe("sk_test_unused", { apiVersion: "2026-11-18.endive" });
const ORIGIN = "http://localhost:8765";
const ENV = {
  STRIPE_WEBHOOK_SECRET: "whsec_test_only_secret",
  LICENSE_SECRET: "test-license-secret-0123456789abcdefghij",
  ALLOWED_ORIGINS: ORIGIN + ", https://tennysene11.github.io",
  APP_URL: "https://tennysene11.github.io/NEXTUP-Recruiting/recruiting/recruiting-tracker.html",
};
const DAY = 86400;
const END = 1900000000;

function subscription(id, status, extra) {
  return {
    id, object: "subscription", status, customer: "cus_1", cancel_at_period_end: false, cancel_at: null, trial_end: END,
    items: { data: [{ current_period_end: END, price: { lookup_key: "openspot_pro_yearly", recurring: { interval: "year" } } }] },
    ...extra,
  };
}

function fakeStripe() {
  const calls = [];
  const db = { subs: {}, sessions: {}, charges: {}, payments: {}, invoices: {} };
  const missing = () => { const e = new Error("No such object"); e.code = "resource_missing"; throw e; };
  const rec = (name, fn) => async (...a) => { calls.push([name, ...a]); return fn(...a); };
  return {
    calls, db,
    webhooks: real.webhooks,
    prices: { list: rec("prices.list", async ({ lookup_keys }) => ({ data: lookup_keys.map((k) => ({ id: "price_" + k, lookup_key: k })) })) },
    checkout: {
      sessions: {
        create: rec("checkout.sessions.create", async () => ({ id: "cs_test_abc", url: "https://checkout.stripe.com/c/pay/cs_test_abc" })),
        retrieve: rec("checkout.sessions.retrieve", async (id) => db.sessions[id] || missing()),
      },
    },
    subscriptions: {
      retrieve: rec("subscriptions.retrieve", async (id) => db.subs[id] || missing()),
      cancel: rec("subscriptions.cancel", async (id) => { db.subs[id].status = "canceled"; return db.subs[id]; }),
    },
    billingPortal: {
      sessions: { create: rec("billingPortal.sessions.create", async () => ({ url: "https://billing.stripe.com/p/session/test_1" })) },
      configurations: { list: rec("billingPortal.configurations.list", async () => ({ data: [{ id: "bpc_other", metadata: {} }, { id: "bpc_1", metadata: { app: "openspot" } }] })) },
    },
    charges: { retrieve: rec("charges.retrieve", async (id) => db.charges[id] || missing()) },
    invoicePayments: { list: rec("invoicePayments.list", async ({ payment }) => ({ data: db.payments[payment.payment_intent] ? [{ invoice: db.payments[payment.payment_intent] }] : [] })) },
    invoices: { retrieve: rec("invoices.retrieve", async (id) => db.invoices[id] || missing()) },
    refunds: { create: rec("refunds.create", async (p) => { db.charges[p.charge].refunded = true; return { id: "re_1" }; }) },
  };
}

function post(path, body, origin = ORIGIN) {
  const headers = { "Content-Type": "application/json" };
  if (origin) headers.Origin = origin;
  return new Request("https://billing.test" + path, { method: "POST", headers, body: JSON.stringify(body || {}) });
}
async function call(stripe, path, body, env = ENV, origin) {
  const res = await handle(post(path, body, origin), env, { stripe });
  return { status: res.status, body: await res.json().catch(() => null), headers: res.headers };
}
function signed(event, secret = ENV.STRIPE_WEBHOOK_SECRET) {
  const payload = JSON.stringify(event);
  const header = real.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("https://billing.test/webhook", { method: "POST", headers: { "Stripe-Signature": header }, body: payload });
}
const evt = (type, object) => ({ id: "evt_" + type, object: "event", type, data: { object } });

// A paid yearly subscription with a charge, its PaymentIntent, an InvoicePayment and an invoice.
function withCharge(stripe, status = "active") {
  stripe.db.subs.sub_A1 = subscription("sub_A1", status);
  stripe.db.charges.ch_1 = { id: "ch_1", object: "charge", payment_intent: "pi_1", refunded: false };
  stripe.db.payments.pi_1 = "in_1";
  stripe.db.invoices.in_1 = { id: "in_1", parent: { type: "subscription_details", subscription_details: { subscription: "sub_A1" } } };
}

test("license keys round-trip and resist forgery", async () => {
  const key = await makeKey("sub_1QxAbC9", ENV.LICENSE_SECRET);
  assert.match(key, /^OS-1QxAbC9-[0-9A-HJKMNP-TV-Z]{16}$/);
  assert.equal(await readKey(key, ENV.LICENSE_SECRET), "sub_1QxAbC9");
  assert.equal(await readKey("  " + key.replace(/-([^-]+)$/, (m, mac) => "-" + mac.toLowerCase()) + " ", ENV.LICENSE_SECRET), "sub_1QxAbC9");
  assert.equal(await readKey(key.replace("1QxAbC9", "1QxAbC8"), ENV.LICENSE_SECRET), null);
  assert.equal(await readKey(key, ENV.LICENSE_SECRET.replace("0", "1")), null);
  assert.equal(await readKey("RT-JWTM-44Q2-QKL5", ENV.LICENSE_SECRET), null);
  await assert.rejects(makeKey("sub_1", "short"));
});

test("checkout starts a 21-day trial subscription with the right options", async () => {
  const stripe = fakeStripe();
  const r = await call(stripe, "/checkout", { cycle: "monthly", return_to: ORIGIN + "/recruiting/recruiting-tracker.html?x=1#home" });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { id: "cs_test_abc", url: "https://checkout.stripe.com/c/pay/cs_test_abc" });
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  const p = stripe.calls.find((c) => c[0] === "checkout.sessions.create")[1];
  assert.equal(p.mode, "subscription");
  assert.deepEqual(p.line_items, [{ price: "price_openspot_pro_monthly", quantity: 1 }]);
  assert.equal(p.subscription_data.trial_period_days, 21);
  assert.equal(p.success_url, ORIGIN + "/recruiting/recruiting-tracker.html?checkout=done&session_id={CHECKOUT_SESSION_ID}");
  assert.equal(p.cancel_url, ORIGIN + "/recruiting/recruiting-tracker.html?checkout=canceled");
  assert.match(p.integration_identifier, /_[a-z]{8}$/);
  assert.equal("payment_method_types" in p, false);
  assert.equal("automatic_tax" in p, false);
});

test("checkout defaults to yearly, ignores outside return URLs and adds tax only when turned on", async () => {
  const stripe = fakeStripe();
  await call(stripe, "/checkout", { cycle: "weekly", return_to: "https://evil.example/phish" }, { ...ENV, AUTOMATIC_TAX: "true" });
  const p = stripe.calls.find((c) => c[0] === "checkout.sessions.create")[1];
  assert.equal(p.line_items[0].price, "price_openspot_pro_yearly");
  assert.ok(p.success_url.startsWith(ENV.APP_URL + "?"));
  assert.deepEqual(p.automatic_tax, { enabled: true });
});

test("only allowed origins and POST get through", async () => {
  const stripe = fakeStripe();
  assert.equal((await call(stripe, "/checkout", {}, ENV, "https://evil.example")).status, 403);
  assert.equal((await call(stripe, "/checkout", {}, ENV, null)).status, 403);
  const pre = await handle(new Request("https://billing.test/checkout", { method: "OPTIONS", headers: { Origin: ORIGIN } }), ENV, { stripe });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  const get = await handle(new Request("https://billing.test/status", { headers: { Origin: ORIGIN } }), ENV, { stripe });
  assert.equal(get.status, 405);
  assert.equal(stripe.calls.length, 0);
});

test("claim turns a finished checkout into a license key", async () => {
  const stripe = fakeStripe();
  stripe.db.sessions.cs_test_done = { id: "cs_test_done", mode: "subscription", status: "complete", payment_status: "no_payment_required", subscription: subscription("sub_T1", "trialing") };
  stripe.db.sessions.cs_test_open = { id: "cs_test_open", mode: "subscription", status: "open", payment_status: "unpaid", subscription: null };
  const r = await call(stripe, "/claim", { session_id: "cs_test_done" });
  assert.equal(r.status, 200);
  assert.equal(r.body.key, await makeKey("sub_T1", ENV.LICENSE_SECRET));
  assert.equal(r.body.active, true);
  assert.equal(r.body.status, "trialing");
  assert.equal(r.body.cycle, "yearly");
  assert.equal(r.body.until, (END + 3 * DAY) * 1000);
  const open = await call(stripe, "/claim", { session_id: "cs_test_open" });
  assert.equal(open.status, 200);
  assert.deepEqual(open.body, { active: false, status: "open" });
  stripe.db.sessions.cs_test_pay = { id: "cs_test_pay", mode: "payment", status: "complete", payment_status: "paid" };
  assert.equal((await call(stripe, "/claim", { session_id: "cs_test_pay" })).status, 400);
  assert.equal((await call(stripe, "/claim", { session_id: "cs_live_nope" })).status, 404);
  assert.equal((await call(stripe, "/claim", { session_id: "../x" })).status, 400);
});

test("status reads the subscription live, so a cancellation shows up at once", async () => {
  const stripe = fakeStripe();
  stripe.db.subs.sub_S1 = subscription("sub_S1", "active");
  const key = await makeKey("sub_S1", ENV.LICENSE_SECRET);
  let r = await call(stripe, "/status", { key });
  assert.equal(r.body.active, true);
  assert.equal(r.body.renews, true);
  stripe.db.subs.sub_S1.status = "canceled";
  r = await call(stripe, "/status", { key });
  assert.equal(r.body.active, false);
  assert.equal(r.body.until, 0);
  assert.equal((await call(stripe, "/status", { key: key.slice(0, -1) + (key.endsWith("A") ? "B" : "A") })).status, 400);
  assert.equal((await call(stripe, "/status", { key: await makeKey("sub_GONE", ENV.LICENSE_SECRET) })).status, 404);
});

test("summarize keeps past_due active and notices a scheduled cancellation", () => {
  assert.equal(summarize(subscription("sub_P", "past_due")).active, true);
  const s = summarize(subscription("sub_C", "active", { cancel_at_period_end: true }));
  assert.equal(s.active, true);
  assert.equal(s.renews, false);
  assert.equal(s.period_end, END * 1000);
  const m = summarize(subscription("sub_M", "trialing", { items: { data: [{ current_period_end: END, price: { recurring: { interval: "month" } } }] } }));
  assert.equal(m.cycle, "monthly");
  assert.equal(summarize(subscription("sub_U", "unpaid")).active, false);
});

test("portal opens for the key's own customer with the OpenSpot configuration", async () => {
  const stripe = fakeStripe();
  stripe.db.subs.sub_P1 = subscription("sub_P1", "active", { customer: "cus_77" });
  const r = await call(stripe, "/portal", { key: await makeKey("sub_P1", ENV.LICENSE_SECRET), return_to: ORIGIN + "/recruiting/recruiting-tracker.html" });
  assert.equal(r.body.url, "https://billing.stripe.com/p/session/test_1");
  const p = stripe.calls.find((c) => c[0] === "billingPortal.sessions.create")[1];
  assert.deepEqual(p, { customer: "cus_77", return_url: ORIGIN + "/recruiting/recruiting-tracker.html", configuration: "bpc_1" });
  assert.equal((await call(stripe, "/portal", { key: "OS-P1-AAAAAAAAAAAAAAAA" })).status, 400);
});

test("webhooks need a valid Stripe signature", async () => {
  const stripe = fakeStripe();
  const e = evt("checkout.session.completed", { id: "cs_test_1", mode: "subscription", payment_status: "no_payment_required", subscription: "sub_1" });
  const ok = await handle(signed(e), ENV, { stripe });
  assert.equal(ok.status, 200);
  const wrong = await handle(signed(e, "whsec_someone_else"), ENV, { stripe });
  assert.equal(wrong.status, 400);
  const none = await handle(new Request("https://billing.test/webhook", { method: "POST", body: JSON.stringify(e) }), ENV, { stripe });
  assert.equal(none.status, 400);
  assert.equal(stripe.calls.length, 0);
});

test("a dispute ends Pro by canceling the subscription, once", async () => {
  const stripe = fakeStripe();
  withCharge(stripe);
  const e = evt("charge.dispute.created", { id: "dp_1", object: "dispute", charge: "ch_1", payment_intent: "pi_1" });
  assert.equal((await handle(signed(e), ENV, { stripe })).status, 200);
  assert.equal(stripe.db.subs.sub_A1.status, "canceled");
  const lookup = stripe.calls.find((c) => c[0] === "invoicePayments.list")[1];
  assert.deepEqual(lookup.payment, { type: "payment_intent", payment_intent: "pi_1" });
  await handle(signed(e), ENV, { stripe });
  assert.equal(stripe.calls.filter((c) => c[0] === "subscriptions.cancel").length, 1);
});

test("an early fraud warning refunds the charge and cancels", async () => {
  const stripe = fakeStripe();
  withCharge(stripe);
  const e = evt("radar.early_fraud_warning.created", { id: "issfr_1", object: "radar.early_fraud_warning", actionable: true, charge: "ch_1" });
  assert.equal((await handle(signed(e), ENV, { stripe })).status, 200);
  const refund = stripe.calls.find((c) => c[0] === "refunds.create");
  assert.deepEqual(refund[1], { charge: "ch_1", reason: "fraudulent" });
  assert.deepEqual(refund[2], { idempotencyKey: "efw-refund-issfr_1" });
  assert.equal(stripe.db.subs.sub_A1.status, "canceled");
});

test("a full refund ends Pro and a partial refund doesn't", async () => {
  const stripe = fakeStripe();
  withCharge(stripe);
  await handle(signed(evt("charge.refunded", { ...stripe.db.charges.ch_1, refunded: false })), ENV, { stripe });
  assert.equal(stripe.db.subs.sub_A1.status, "active");
  await handle(signed(evt("charge.refunded", { ...stripe.db.charges.ch_1, refunded: true })), ENV, { stripe });
  assert.equal(stripe.db.subs.sub_A1.status, "canceled");
});

test("lifecycle events are acknowledged without changing anything", async () => {
  const stripe = fakeStripe();
  for (const type of ["customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed", "checkout.session.async_payment_failed"]) {
    const o = type.startsWith("invoice") ? { id: "in_9", parent: { subscription_details: { subscription: "sub_9" } } } : { id: "sub_9", status: "active" };
    assert.equal((await handle(signed(evt(type, o)), ENV, { stripe })).status, 200);
  }
  assert.equal(stripe.calls.length, 0);
});

test("a Stripe outage returns 500 so Stripe retries the event", async () => {
  const stripe = fakeStripe();
  withCharge(stripe);
  stripe.subscriptions.retrieve = async () => { throw Object.assign(new Error("timeout"), { type: "StripeConnectionError" }); };
  const errors = console.error;
  console.error = () => {};
  const res = await handle(signed(evt("charge.dispute.created", { id: "dp_2", charge: "ch_1" })), ENV, { stripe });
  console.error = errors;
  assert.equal(res.status, 500);
});

test("the Worker entry exports only a default handler, as Cloudflare requires", async () => {
  const mod = await import("../src/index.js");
  assert.deepEqual(Object.keys(mod), ["default"]);
  assert.equal(typeof mod.default.fetch, "function");
});

test("a webhook about a deleted object is acknowledged instead of retried", async () => {
  const stripe = fakeStripe();
  const res = await handle(signed(evt("charge.dispute.created", { id: "dp_3", charge: "ch_gone" })), ENV, { stripe });
  assert.equal(res.status, 200);
});
