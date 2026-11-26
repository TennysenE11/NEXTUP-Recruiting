// License keys for OpenSpot Pro.
// A key is the Stripe subscription ID plus an 80-bit HMAC of it. The server can check a key
// without a database, and nobody can make a key for another family's subscription.
// Format: OS-<subscription ID without "sub_">-<16 base32 characters>

const enc = new TextEncoder();
const ALPHA = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32: no I, L, O or U

async function mac(subId, secret) {
  if (!secret || secret.length < 32) throw new Error("LICENSE_SECRET must be at least 32 characters.");
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode("openspot-pro:" + subId)));
  let bits = 0, val = 0, out = "";
  for (let i = 0; i < 10; i++) {
    val = (val << 8) | sig[i];
    bits += 8;
    while (bits >= 5) {
      out += ALPHA[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
    val &= (1 << bits) - 1;
  }
  return out;
}

export async function makeKey(subId, secret) {
  if (!/^sub_[A-Za-z0-9]+$/.test(String(subId))) throw new Error("Not a subscription ID.");
  return "OS-" + subId.slice(4) + "-" + (await mac(subId, secret));
}

// Returns the subscription ID for a valid key, or null.
export async function readKey(key, secret) {
  const m = /^OS-([A-Za-z0-9]+)-([0-9A-Za-z]{16})$/.exec(String(key || "").trim());
  if (!m) return null;
  const subId = "sub_" + m[1];
  const want = await mac(subId, secret);
  const got = m[2].toUpperCase();
  let diff = 0;
  for (let i = 0; i < 16; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0 ? subId : null;
}
