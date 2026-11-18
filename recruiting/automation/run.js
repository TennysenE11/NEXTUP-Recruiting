#!/usr/bin/env node
// Automatic sending helper for the recruiting tracker.
// It drives recruiting-tracker.html in headless Chromium, so emails are written by exactly the same
// code the app uses. It never sends email itself: the scheduled Claude task sends what `plan` writes.
//
//   node run.js plan <profile.json> <outbox.json>   pick this week's emails and write them out
//   node run.js mark <id> [<id>...]                  record emails as sent (sets next follow-up)
//   node run.js replied <id> [<id>...]               record a coach reply (stops automatic follow-ups)
//   node run.js contacted                            list emailed coaches (id, school, email) for reply checks
//
// tracker.json holds program data only. The player's profile is passed in at run time and never saved here.
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const DIR = __dirname;
const APP = "file://" + path.resolve(DIR, "..", "recruiting-tracker.html");
const TRACKER = path.join(DIR, "tracker.json");
const NEW_PER_RUN = 10, MAX_FOLLOWUPS = 3;

function today() { const d = new Date(); return d.toISOString().slice(0, 10); }
function load() { return JSON.parse(fs.readFileSync(TRACKER, "utf8")); }
function saveTracker(t) { fs.writeFileSync(TRACKER, JSON.stringify(t, null, 1) + "\n"); }

async function withApp(tracker, profile, fn) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const stateJson = JSON.stringify({ programs: tracker.programs, updates: tracker.updates || [], ui: tracker.ui || {}, profile: profile || {} });
  await page.addInitScript(s => { try { localStorage.setItem("recruitTracker.v1", s); } catch (e) {} }, stateJson);
  await page.goto(APP);
  try { return await fn(page); } finally { await browser.close(); }
}
function inRegion(t, p) { const sel = t.ui && t.ui.states; return !Array.isArray(sel) || sel.includes((p.state || "").toUpperCase()); }
function ratio(p) { const n = parseInt(p.roster_leaving, 10), t = parseInt(p.roster_pitchers, 10); return isNaN(n) || !t ? -1 : n / t; }

async function plan(profilePath, outPath) {
  const t = load(), profile = JSON.parse(fs.readFileSync(profilePath, "utf8")), now = today();
  const followups = t.programs.filter(p => p.status === "Emailed" && p.replied !== "yes" && p.coach_email &&
    p.next_followup && p.next_followup <= now && (parseInt(p.followups_sent, 10) || 0) < MAX_FOLLOWUPS);
  const fresh = t.programs.filter(p => p.status === "Not contacted" && p.coach_email && !/\bverify\b/i.test(p.notes) &&
    !/^no/i.test(p.business_major || "") && inRegion(t, p))
    .sort((a, b) => ratio(b) - ratio(a) || a.school.localeCompare(b.school)).slice(0, NEW_PER_RUN);
  const pick = followups.concat(fresh);
  // Only program facts that were checked on the school's own site go out without review.
  const draftState = { ...t, programs: t.programs.map(p => (p.fact_checked === "yes" ? p : { ...p, program_fact: "" })) };
  const out = await withApp(draftState, profile, page => page.evaluate(ids =>
    ids.map(id => { const p = window.__tracker.state().programs.find(x => x.id === id); const d = window.__tracker.draftFor(id);
      return { id, school: p.school, kind: p.date_emailed ? "follow-up" : "first", to: d.to, subject: d.subject, body: d.body }; }),
    pick.map(p => p.id)));
  const bad = out.filter(o => /\[[^\]]+\]/.test(o.subject + o.body) || !o.to);
  if (bad.length) throw new Error("Missing profile details or email for: " + bad.map(o => o.school).join(", "));
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log(`${out.length} emails planned (${followups.length} follow-ups, ${fresh.length} new) -> ${outPath}`);
  out.forEach(o => console.log(`  ${o.kind.padEnd(9)} ${o.school} <${o.to}>`));
}

async function mark(ids) {
  const t = load();
  const after = await withApp(t, {}, page => page.evaluate(ids => { ids.forEach(id => window.__tracker.markSent(id)); return window.__tracker.state(); }, ids));
  t.programs = after.programs.map(p => { const { variant, ...rest } = p; return { ...rest, variant: p.variant || 0 }; });
  saveTracker(t);
  ids.forEach(id => { const p = t.programs.find(x => x.id === id); console.log(p ? `marked ${p.school}: next follow-up ${p.next_followup}` : `unknown id ${id}`); });
}

function replied(ids) {
  const t = load();
  ids.forEach(id => { const p = t.programs.find(x => x.id === id); if (!p) return console.log("unknown id " + id);
    p.replied = "yes"; if (p.status === "Emailed" || p.status === "Not contacted") p.status = "Replied"; p.next_followup = "";
    p.notes = (p.notes ? p.notes + " " : "") + "Coach replied (found " + today() + ")."; console.log("replied: " + p.school); });
  saveTracker(t);
}

function contacted() {
  load().programs.filter(p => p.date_emailed && p.replied !== "yes")
    .forEach(p => console.log([p.id, p.school, p.coach_email, p.date_emailed].join("\t")));
}

(async () => {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "plan" && args.length === 2) await plan(args[0], args[1]);
  else if (cmd === "mark" && args.length) await mark(args);
  else if (cmd === "replied" && args.length) replied(args);
  else if (cmd === "contacted") contacted();
  else { console.error("usage: run.js plan <profile.json> <outbox.json> | mark <id...> | replied <id...> | contacted"); process.exit(2); }
})().catch(e => { console.error("ERROR: " + e.message); process.exit(1); });
