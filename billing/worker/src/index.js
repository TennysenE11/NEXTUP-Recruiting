// Cloudflare Worker entry for OpenSpot billing. Workers treat every named export of this file as
// a handler, so the logic and its exports live in billing.js.
import { handle, makeStripe } from "./billing.js";

export default {
  fetch(request, env) {
    return handle(request, env, { stripe: makeStripe(env) });
  },
};
