// Single place for facts and settings shown on the website.
// Every number here comes from the app's own national data (checked 2026-11-18).

export const APP_NAME = "Recruiting Tracker";
export const APP_URL = "./recruiting/"; // the installable app, hosted next to this site
export const CONTACT_EMAIL = ""; // set before launch; when blank, buttons say the waitlist opens soon

export const STATS = [
  { value: "1,600", label: "college baseball programs", note: "D1, D2, D3, NAIA and JUCO" },
  { value: "890", label: "coach emails", note: "copied from official athletics pages" },
  { value: "625", label: "X accounts", note: "linked on official pages" },
  { value: "696", label: "rosters read", note: "to count pitchers leaving" },
];

export type Route = "home" | "features" | "how-it-works" | "pricing" | "faq" | "privacy" | "not-found";

export const NAV: { route: Route; label: string }[] = [
  { route: "features", label: "Features" },
  { route: "how-it-works", label: "How it works" },
  { route: "pricing", label: "Pricing" },
  { route: "faq", label: "FAQ" },
];

export const TITLES: Record<Route, string> = {
  home: "Recruiting Tracker | College baseball recruiting, one coach at a time",
  features: "Features | Recruiting Tracker",
  "how-it-works": "How it works | Recruiting Tracker",
  pricing: "Pricing | Recruiting Tracker",
  faq: "FAQ | Recruiting Tracker",
  privacy: "Privacy | Recruiting Tracker",
  "not-found": "Page not found | Recruiting Tracker",
};

// ---- Plans (see reports/Recruiting app subscription pricing.md for the research behind these) ----
export const PRO = {
  monthly: 12.99,
  yearly: 99,
};
export const yearlySavingsPct = () => Math.round(100 * (1 - PRO.yearly / (PRO.monthly * 12)));

export const FREE_FEATURES = [
  "National list of 1,600 college baseball programs",
  "A personal email for every coach, written from their roster",
  "Two-tap sending from your own Gmail",
  "Follow-up reminders, goals and weekly plan",
  "X messages and Seen tracking",
  "Profile score and Reach / Target / Likely outlook",
  "Charts, filters, export and import",
];
export const PRO_FEATURES = [
  "Everything in Free",
  "Automatic weekly sending from your own Gmail, on your schedule",
  "Reply detection: coaches who answer are never auto-emailed",
  "Duplicate check against your Sent mail",
  "Sync between phone and computer",
  "Coach data refreshed every fall and mid-season",
];

// Market context shown on the pricing page (reported prices, November 2026; ranges, not exact quotes).
export const MARKET = [
  { what: "Self-serve recruiting and coach-email apps", price: "about $15 to $35 a month", note: "most publish prices; yearly plans run about 17 to 33% off" },
  { what: "Scouting data memberships", price: "about $20 a month or $120 to $400 a year", note: "rankings, reports and video access" },
  { what: "Full-service recruiting services", price: "about $1,000 to $6,000", note: "usually quoted on a sales call, often with contracts" },
  { what: "One showcase event", price: "about $250 to $750", note: "plus travel" },
];
