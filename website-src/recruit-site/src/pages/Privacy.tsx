import { PageHead } from "@/components/site/PageHead";

export function Privacy() {
  return (
    <>
      <PageHead kicker="Privacy" title="Your data stays on your phone" lead="Plain-language summary of how the free app handles information. Last updated November 2026." />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-[17px] leading-relaxed sm:px-6">
        <section>
          <h2 className="text-2xl font-extrabold uppercase">What the app stores</h2>
          <p className="mt-2">Your profile (name, stats, contact details), your school list, notes, goals and send history are saved only in your browser or installed app on your device. There is no account and no server that receives them.</p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold uppercase">What leaves your device</h2>
          <p className="mt-2">Only what you choose to send. When you tap Send in Gmail or Mail app, the email opens in your own email account and you decide whether to send it. When you tap Open on X, X opens. Backups you export are files you control.</p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold uppercase">Coach information</h2>
          <p className="mt-2">Coach names, titles, emails and X accounts in the national list are copied from public, official college athletics pages. Coaches who want an entry corrected can ask and we'll fix it.</p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold uppercase">No tracking</h2>
          <p className="mt-2">The app has no ads, no analytics and no tracking pixels, and it never adds open-tracking to your emails.</p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold uppercase">Students under 18</h2>
          <p className="mt-2">Most users are high school students. The free app collects nothing about them. Before any paid plan launches, a parent or guardian will be the account holder, and a full privacy policy and terms will be published here.</p>
        </section>
      </article>
    </>
  );
}
