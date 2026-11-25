// Single place for facts and settings shown on the website.
// Every number here comes from the app's own national data (checked 2026-11-18).

export const APP_NAME = "NEXTUP";
export const APP_URL = "./recruiting/"; // the installable app, hosted next to this site
export const CONTACT_EMAIL = ""; // set before launch; when blank, buttons say the waitlist opens soon

export const STATS = [
  { value: "1,600", label: "college programs", note: "D1, D2, D3, NAIA and JUCO" },
  { value: "890", label: "official coach emails", note: "copied from athletics pages" },
  { value: "829", label: "college logos", note: "from official athletics sites" },
  { value: "0", label: "guessed addresses", note: "if a page wasn't clear, we say so" },
];

// Real screenshots of the app (a made-up demo shortstop; coach emails masked).
export const SHOTS = {
  send: "site-assets/app-send.jpg",
  schools: "site-assets/app-schools.jpg",
  home: "site-assets/app-home.jpg",
  profile: "site-assets/app-profile.jpg",
  goals: "site-assets/app-goals.jpg",
};

export const POSITIONS = [
  { pos: "Pitchers", numbers: "Velo, pitch mix", coach: "Pitching coach", roster: "pitchers leaving" },
  { pos: "Catchers", numbers: "Pop time, exit velo", coach: "Recruiting coordinator or head coach", roster: "catchers leaving" },
  { pos: "Infielders", numbers: "Exit velo, IF velo, 60", coach: "Recruiting coordinator or head coach", roster: "infielders leaving" },
  { pos: "Outfielders", numbers: "Exit velo, OF velo, 60", coach: "Recruiting coordinator or head coach", roster: "outfielders leaving" },
  { pos: "Two-way", numbers: "Both, in one email", coach: "Pitching coach first", roster: "your main position" },
];

export type Route = "home" | "features" | "how-it-works" | "pricing" | "faq" | "privacy" | "not-found";

export const NAV: { route: Route; label: string }[] = [
  { route: "features", label: "Features" },
  { route: "how-it-works", label: "How it works" },
  { route: "pricing", label: "Pricing" },
  { route: "faq", label: "FAQ" },
];

export const TITLES: Record<Route, string> = {
  home: "NEXTUP | College baseball recruiting, one coach at a time",
  features: "Features | NEXTUP",
  "how-it-works": "How it works | NEXTUP",
  pricing: "Pricing | NEXTUP",
  faq: "FAQ | NEXTUP",
  privacy: "Privacy | NEXTUP",
  "not-found": "Page not found | NEXTUP",
};

// ---- Plans (see reports/Recruiting app subscription pricing.md for the research behind these) ----
export const PRO = {
  monthly: 12.99,
  yearly: 99,
};
export const yearlySavingsPct = () => Math.round(100 * (1 - PRO.yearly / (PRO.monthly * 12)));

export const FREE_LIMIT = 20;
export const FREE_FEATURES = [
  "20 schools",
  "Personal email for every coach",
  "Two-tap sending",
  "Follow-up reminders",
  "Profile score",
];
export const PRO_FEATURES = [
  "Unlimited schools",
  "Reach, Target or Likely outlook",
  "Players leaving at your position",
  "Goals and a weekly plan",
  "Charts and every filter",
  "X messages",
  "Automatic weekly sending",
];

// Market context shown on the pricing page (reported prices, November 2026; ranges, not exact quotes).
export const MARKET = [
  { what: "Recruiting email apps", price: "about $15 to $35 a month", note: "most publish prices; yearly plans run about 17 to 33% off" },
  { what: "Scouting memberships", price: "about $120 to $400 a year", note: "rankings, reports and video access" },
  { what: "Recruiting services", price: "about $1,000 to $6,000", note: "usually quoted on a sales call, often with contracts" },
  { what: "One showcase event", price: "about $250 to $750", note: "plus travel" },
];
