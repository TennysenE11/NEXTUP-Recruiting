# Marketing website

Source for the site served at the repo root (`index.html`). React + TypeScript + Tailwind + shadcn/ui, bundled into one HTML file.

- Pages: Home, Features, How it works, Pricing, FAQ, Privacy (hash routes like `#/pricing`).
- Plan prices, features and market ranges live in `recruit-site/src/lib/site.ts`. The research behind the prices is in `reports/Recruiting app subscription pricing.md`.
- Set `CONTACT_EMAIL` in `site.ts` to turn on the Pro waitlist button.

Build: `cd recruit-site && pnpm install`, then run the web-artifacts-builder bundle script (or `npx parcel build index.html` and inline the assets). Copy the resulting `bundle.html` to the repo root as `index.html`.
