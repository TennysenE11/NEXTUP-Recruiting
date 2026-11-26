// Prints the license key for a subscription, for support: a family lost their key and you found
// their subscription in the Stripe Dashboard. Uses the same LICENSE_SECRET as the Worker.
//
//   LICENSE_SECRET=... node scripts/license-key.mjs sub_123
import { makeKey } from "../src/license.js";

const sub = process.argv[2];
if (!sub || !process.env.LICENSE_SECRET) {
  console.error("Usage: LICENSE_SECRET=... node scripts/license-key.mjs sub_...");
  process.exit(1);
}
console.log(await makeKey(sub, process.env.LICENSE_SECRET));
