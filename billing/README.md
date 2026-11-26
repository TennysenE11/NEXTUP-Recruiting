# OpenSpot billing

OpenSpot Pro is sold with Stripe Billing: $12.99 a month or $99 a year, each with a 21-day free trial. The app is a static page with no accounts, so a small Cloudflare Worker in `worker/` does the parts that need a Stripe key.

A parent or guardian has to open the Stripe account and the Cloudflare account and own them. Stripe and Cloudflare both require an adult account holder.

## How it works

1. The Pro sheet in the app calls the Worker, which creates a Stripe Checkout session (subscription mode, 21-day trial, card required).
2. Stripe sends the buyer back to the app with a session ID. The app trades it for a license key at `/claim`. If the phone closed the tab before Stripe sent it back, the app claims the pending session the next time it opens.
3. The app checks the key at `/status` at most twice a day. The Worker reads the subscription live from Stripe, so a cancellation or failed payment shows up on the next check. Offline, Pro stays on until the paid-through date plus 3 days.
4. "Manage subscription" opens the Stripe Customer Portal: cancel, change card, switch monthly and yearly, see invoices.
5. The webhook acts on risk events. A dispute cancels the subscription. A Radar early fraud warning refunds the charge and cancels. A full refund cancels. Lifecycle events are logged.

There is no database. Stripe is the only record of who has paid. A license key is the subscription ID plus an HMAC signature (`worker/src/license.js`), so the Worker can check it without storing anything and nobody can make a key for someone else's subscription.

One limit to know: the app keeps its data in the browser, so someone who edits browser storage can switch Pro features on without paying. The Worker protects subscriptions and the Customer Portal. It can't protect features that run on the device.

## Files

| File | What it does |
| --- | --- |
| `worker/src/billing.js` | Routes: `/checkout`, `/claim`, `/status`, `/portal`, `/webhook` |
| `worker/src/index.js` | Worker entry point |
| `worker/src/license.js` | License keys |
| `worker/scripts/setup-catalog.mjs` | Creates the product, both prices and the Customer Portal settings |
| `worker/scripts/license-key.mjs` | Prints the key for a subscription, for support |
| `worker/test/worker.test.mjs` | Tests: `npm test` |
| `worker/wrangler.toml` | Worker settings (no secrets) |

## Set it up in a sandbox first

### 1. Stripe sandbox and keys

In the Stripe Dashboard, create a sandbox for development. Then create two restricted keys (`rk_test_...`) in it. A restricted key can only do what you allow, so a leaked one does less damage than a secret key.

- **Setup key** for the catalog script: Products write, Prices write, Customer portal write, Tax settings read, Tax registrations read.
- **Worker key**: Checkout Sessions write, Prices read, Subscriptions write, Customer portal write, Charges read, Refunds write, Invoices read.

If the Worker logs a permission error, add the permission it names to the Worker key.

Never put a key in a file in this repo. A git hook blocks commits that contain one. Turn it on once per clone with `git config core.hooksPath .githooks`.

### 2. Create the product and prices

```sh
cd billing/worker
npm install
STRIPE_API_KEY=<setup key> npm run catalog
```

This creates the product `openspot_pro` and two prices with the lookup keys `openspot_pro_monthly` and `openspot_pro_yearly`. The Worker finds prices by lookup key, so there are no price IDs to copy. Running it again skips what already exists.

Two tax decisions belong to you and a tax advisor:

- **Tax code.** List Stripe's codes with `STRIPE_API_KEY=<setup key> node scripts/setup-catalog.mjs --find-tax-codes software`, pick one, and rerun with `--tax-code txcd_...`. Stripe's list is at [docs.stripe.com/tax/tax-codes](https://docs.stripe.com/tax/tax-codes).
- **Tax behavior.** `--tax-behavior exclusive` adds tax on top of $12.99 and $99. `--tax-behavior inclusive` takes it out of those prices. Prices are fixed once created, so decide before your first run.

### 3. Dashboard settings

- **Billing → Subscriptions and emails**: turn on the email 7 days before a free trial ends, the email before renewals (the pricing page promises a reminder before any yearly renewal), and emails for failed payments. Turn on Smart Retries.
- **Settings → Branding**: logo and the purple `#6827e2`, so Checkout and the portal look like OpenSpot.

### 4. Deploy the Worker

```sh
npx wrangler login
npx wrangler secret put STRIPE_SECRET_KEY      # the Worker key
npx wrangler secret put LICENSE_SECRET         # 32+ random characters, kept forever
npx wrangler deploy
```

Wrangler prints the Worker's address, for example `https://openspot-billing.<name>.workers.dev`. Changing `LICENSE_SECRET` later breaks every license key, so store a copy somewhere safe.

### 5. Webhook endpoint

In the Dashboard under Developers → Webhooks, add an endpoint at `<Worker address>/webhook` with these events:

```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.paused
customer.subscription.resumed
invoice.paid
invoice.payment_failed
charge.dispute.created
charge.refunded
radar.early_fraud_warning.created
```

Copy its signing secret, then run `npx wrangler secret put STRIPE_WEBHOOK_SECRET`.

### 6. Turn it on in the app

In `recruiting/recruiting-tracker.html`, set the Worker address:

```js
var BILLING_URL = String(window.OPENSPOT_BILLING_URL || "https://openspot-billing.<name>.workers.dev").replace(/\/$/, "");
```

While `BILLING_URL` is blank, the app behaves as before: Pro is unlocked only with a code.

### 7. Test

- Card `4242 4242 4242 4242`, any future date and CVC: the trial starts.
- Card `4000 0000 0000 0341`: the trial starts, then the first charge fails when it ends.
- To get past the 21 days without waiting, create the test subscription on a test clock and advance it.
- `stripe trigger charge.dispute.created` and `stripe trigger radar.early_fraud_warning.created` send risk events to the webhook. Watch them in the Worker log with `npx wrangler tail`.

Locally, copy `.dev.vars.example` to `.dev.vars`, fill in test values and run `npx wrangler dev`.

## Sales tax

Stripe Tax collects nothing until the account has an active tax registration for a state. Leave `AUTOMATIC_TAX = "false"` in `wrangler.toml` until a registration shows as Collecting in Dashboard → Tax → Locations. Stripe Tax's threshold monitoring (Tax → Locations → Needs attention) shows when sales in a state may require registering. Whether and where to register is a question for a tax advisor. Setup steps: [docs.stripe.com/billing/taxes/collect-taxes](https://docs.stripe.com/billing/taxes/collect-taxes).

## Going live

1. Repeat steps 1, 2 and 5 in live mode: new restricted live keys, `npm run catalog -- --live`, and a live webhook endpoint with its own signing secret.
2. Put the live Worker key and live webhook secret in the Worker with `wrangler secret put`. Keep the same `LICENSE_SECRET`.
3. Change the website's Pricing page from "Coming 2027" to a "Start free trial" button that opens the app's Pro sheet.
4. Run Stripe's [go-live checklist](https://docs.stripe.com/get-started/checklist/go-live).
