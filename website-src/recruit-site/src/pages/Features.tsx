import { BarChart3, Database, Gauge, Goal, Mail, MessageSquare, Smartphone, Wand2, Filter, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/site";
import { PageHead } from "@/components/site/PageHead";

const GROUPS = [
  {
    title: "Find the right programs",
    items: [
      { icon: Database, t: "1,600 programs, official sources", d: "Every D1, D2, D3, NAIA and junior college baseball program we could find. Coach names, titles and emails are copied from each school's official athletics page, never guessed." },
      { icon: Filter, t: "Filters that matter", d: "Division, state or region, fit for you, has an email, has an X account, and how many pitchers each team is losing. Twelve more filters for your own list." },
      { icon: Gauge, t: "A realistic outlook", d: "From your top fastball, handedness, height and GPA, each level is rated Reach, Target or Likely, with a check on whether your list is balanced." },
    ],
  },
  {
    title: "Write and send",
    items: [
      { icon: Wand2, t: "A different email for every coach", d: "Each email opens with something only that coach would recognize, like how many of their pitchers are seniors, plus a question that fits the level." },
      { icon: Mail, t: "Two taps to send", d: "Send in Gmail opens the finished email in your own account and marks it sent. Press Send, come back, and the next one is ready. Undo if you change your mind." },
      { icon: MessageSquare, t: "X messages too", d: "For coaches with an X account linked on official pages, copy the message and open their profile in one tap. Mark it Seen when X shows it." },
    ],
  },
  {
    title: "Stay on it",
    items: [
      { icon: Bell, t: "Follow-ups on time", d: "Ten days after the first email, then every 14 days. Each follow-up leads with your newest velo, video or showcase date." },
      { icon: Goal, t: "Goals with a plan", d: "Set a goal like 10 replies. The app turns it into this week's to-do list from your own numbers." },
      { icon: BarChart3, t: "Charts that are real", d: "From list to offer, reply rate by division, emails per week. No fake open tracking; replies, calls and offers are what count." },
      { icon: Smartphone, t: "An app on your phone", d: "Add it to your home screen. It opens full screen, works offline, and keeps your data on your device." },
    ],
  },
];

export function Features() {
  return (
    <>
      <PageHead kicker="Features" title="Everything a recruit needs. Nothing that fakes it." lead="Built around how coaches actually read email: short, specific, honest, and followed up on time." />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        {GROUPS.map((g) => (
          <section key={g.title} className="grid gap-8 md:grid-cols-[220px_1fr]">
            <h2 className="text-3xl font-extrabold uppercase leading-none text-accent">{g.title}</h2>
            <div className="grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2">
              {g.items.map((it) => (
                <div key={it.t} className="bg-card p-6">
                  <it.icon className="h-6 w-6 text-field" aria-hidden />
                  <h3 className="mt-3 text-xl font-bold uppercase">{it.t}</h3>
                  <p className="mt-2 text-[15px] text-muted-foreground">{it.d}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="flex flex-col gap-3 border-t pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lg">All of this is free in the app today.</p>
          <Button asChild size="lg" className="h-12 rounded-sm bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-accent/90"><a href={APP_URL}>Open the app</a></Button>
        </div>
      </div>
    </>
  );
}
