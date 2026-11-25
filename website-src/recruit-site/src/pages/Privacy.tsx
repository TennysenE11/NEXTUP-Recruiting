import { Intro } from "@/components/site/Intro";

const SECTIONS = [
  ["What the app stores", "Your profile (name, numbers, contact details), your school list, notes, goals and send history are saved only in your browser or installed app on your device. There is no account and no server that receives them."],
  ["What leaves your device", "Only what you choose to send. When you tap Send in Gmail, the email opens in your own email account and you decide whether to send it. When you tap Open on X, X opens. Backups you export are files you control."],
  ["Coach information", "Coach names, titles, emails and X accounts in the national list are copied from public, official college athletics pages. Coaches who want an entry corrected can ask and we'll fix it."],
  ["No tracking", "The app has no ads, no analytics and no tracking pixels, and it never adds open tracking to your emails."],
  ["Students under 18", "Most users are high school students. The free app collects nothing about them. Before any paid plan launches, a parent or guardian will be the account holder, and a full privacy policy and terms will be published here."],
];

export function Privacy() {
  return (
    <>
      <Intro eyebrow="Privacy" title="Your data stays on your phone." lead="A plain-language summary of how the free app handles information. Last updated November 2026." />
      <article className="mx-auto max-w-6xl px-5 sm:px-8">
        {SECTIONS.map(([t, d]) => (
          <section key={t} className="reveal grid gap-3 border-t border-foreground/10 py-8 md:grid-cols-[1fr_1.8fr] md:gap-16">
            <h2 className="display text-[32px] leading-none">{t}</h2>
            <p className="max-w-2xl text-[17px] leading-relaxed">{d}</p>
          </section>
        ))}
      </article>
    </>
  );
}
