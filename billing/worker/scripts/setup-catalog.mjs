// Creates OpenSpot Pro in a Stripe account: one product, a monthly and a yearly price, and a
// Customer Portal configuration. Safe to run more than once: it skips what already exists.
//
//   STRIPE_API_KEY=rk_test_... node scripts/setup-catalog.mjs
//   STRIPE_API_KEY=... node scripts/setup-catalog.mjs --tax-code txcd_... --tax-behavior exclusive
//   STRIPE_API_KEY=... node scripts/setup-catalog.mjs --find-tax-codes software subscription
//   STRIPE_API_KEY=rk_live_... node scripts/setup-catalog.mjs --live   (only after testing)
//
// The key comes from the environment only. Never paste a key into this file.
import Stripe from "stripe";
import { API_VERSION, LOOKUP } from "../src/billing.js";

const PRODUCT = "openspot_pro";
const PRICES = [
  { lookup_key: LOOKUP.monthly, unit_amount: 1299, interval: "month", nickname: "Pro monthly" },
  { lookup_key: LOOKUP.yearly, unit_amount: 9900, interval: "year", nickname: "Pro yearly" },
];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "";
};
if (!process.env.STRIPE_API_KEY) {
  console.error("Set STRIPE_API_KEY to a test-mode key first.");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: API_VERSION, maxNetworkRetries: 2 });

async function findTaxCodes(words) {
  const terms = words.map((w) => w.toLowerCase());
  const hits = [];
  for await (const c of stripe.taxCodes.list({ limit: 100 })) {
    const text = (c.name + " " + c.description).toLowerCase();
    if (terms.every((t) => text.includes(t))) hits.push(c);
  }
  if (!hits.length) console.log("No tax codes match. Try fewer words.");
  for (const c of hits) console.log(c.id + "  " + c.name + "\n    " + c.description + "\n");
  console.log("Pick one with your tax advisor, then rerun with --tax-code <id>.");
}

async function product(taxCode) {
  try {
    const p = await stripe.products.retrieve(PRODUCT);
    if (taxCode && p.tax_code !== taxCode) {
      if (p.tax_code) console.log("Product already has tax code " + idOf(p.tax_code) + ". Leaving it. Change it in the Dashboard if you mean to.");
      else {
        await stripe.products.update(PRODUCT, { tax_code: taxCode });
        console.log("Set tax code " + taxCode + " on " + PRODUCT + ".");
      }
    }
    console.log("Product " + PRODUCT + " exists.");
    return p;
  } catch (err) {
    if (err.code !== "resource_missing") throw err;
  }
  const params = {
    id: PRODUCT,
    name: "OpenSpot Pro",
    description: "Unlimited schools, realistic outlook, players leaving at your position, goals, charts, X messages and every filter.",
  };
  if (taxCode) params.tax_code = taxCode;
  const p = await stripe.products.create(params);
  console.log("Created product " + p.id + ".");
  return p;
}

async function prices(taxBehavior) {
  const found = await stripe.prices.list({ lookup_keys: PRICES.map((p) => p.lookup_key), limit: 10 });
  const ids = {};
  for (const want of PRICES) {
    const have = found.data.find((p) => p.lookup_key === want.lookup_key);
    if (have) {
      const same = have.unit_amount === want.unit_amount && have.recurring && have.recurring.interval === want.interval && have.active;
      console.log((same ? "Price exists: " : "Price exists but differs, left alone: ") + want.lookup_key + " " + have.id);
      ids[want.lookup_key] = have.id;
      continue;
    }
    const params = {
      product: PRODUCT,
      currency: "usd",
      unit_amount: want.unit_amount,
      recurring: { interval: want.interval },
      lookup_key: want.lookup_key,
      nickname: want.nickname,
    };
    if (taxBehavior) params.tax_behavior = taxBehavior;
    const p = await stripe.prices.create(params);
    console.log("Created price " + want.lookup_key + " " + p.id + ".");
    ids[want.lookup_key] = p.id;
  }
  return ids;
}

async function portal(ids) {
  const list = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const mine = list.data.find((c) => c.metadata && c.metadata.app === "openspot");
  if (mine) {
    console.log("Customer Portal configuration exists: " + mine.id);
    return;
  }
  const c = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Manage your OpenSpot Pro plan" },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: { enabled: true, options: ["too_expensive", "unused", "missing_features", "switched_service", "other"] },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        products: [{ product: PRODUCT, prices: [ids[LOOKUP.monthly], ids[LOOKUP.yearly]] }],
        proration_behavior: "create_prorations",
        trial_update_behavior: "continue_trial",
      },
    },
    metadata: { app: "openspot" },
  });
  console.log("Created Customer Portal configuration " + c.id + ".");
}

async function taxReport() {
  try {
    const s = await stripe.tax.settings.retrieve();
    const regs = await stripe.tax.registrations.list({ status: "active", limit: 100 });
    console.log("\nStripe Tax settings: " + s.status + (s.defaults && s.defaults.tax_behavior ? ", default tax behavior " + s.defaults.tax_behavior : "") + ".");
    console.log("Active tax registrations: " + regs.data.length + ".");
    if (!regs.data.length) console.log("Stripe collects no sales tax until you add a registration. Keep AUTOMATIC_TAX=false until then.");
  } catch (err) {
    console.log("\nCouldn't read Stripe Tax settings (" + (err.code || err.message) + "). The key may lack Tax read access.");
  }
}

function idOf(x) {
  return typeof x === "string" ? x : x && x.id;
}

const me = await stripe.balance.retrieve().catch((err) => err);
if (me && me.livemode && !args.includes("--live")) {
  console.error("This is a live-mode key. Test in a sandbox first, then rerun with --live on purpose.");
  process.exit(1);
}
if (args.includes("--find-tax-codes")) {
  await findTaxCodes(args.slice(args.indexOf("--find-tax-codes") + 1).filter((a) => !a.startsWith("--")));
} else {
  const taxCode = flag("--tax-code");
  const taxBehavior = flag("--tax-behavior");
  if (taxBehavior && !["exclusive", "inclusive"].includes(taxBehavior)) {
    console.error("--tax-behavior must be exclusive (tax added on top) or inclusive (tax inside the price).");
    process.exit(1);
  }
  await product(taxCode);
  const ids = await prices(taxBehavior);
  await portal(ids);
  await taxReport();
  console.log("\nDone. The billing server finds these prices by lookup key, so there are no IDs to copy.");
}
