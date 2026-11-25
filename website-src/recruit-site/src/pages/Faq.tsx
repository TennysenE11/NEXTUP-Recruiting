import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Intro } from "@/components/site/Intro";
import { Link } from "@/lib/router";

const QA: { q: string; a: React.ReactNode }[] = [
  { q: "What's free and what's Pro?", a: "Free covers your first 20 schools: a personal email for each coach, two-tap sending, follow-up reminders, the profile score, basic filters, and export and import. Pro adds unlimited schools, the realistic outlook, players leaving at your position, goals with a weekly plan, charts, X messages, every filter and, at launch, automatic weekly sending. See Pricing." },
  { q: "Does it work for my position?", a: "Yes. Pitchers, catchers, infielders, outfielders and two-way players. Your position decides which numbers go in the email (fastball and pitch mix, or exit velo, 60 time, pop time and throwing velo), who it goes to (the pitching coach for pitchers, the recruiting coordinator or head coach for everyone else) and which part of the roster it reads." },
  { q: "Where do the coach emails come from?", a: "From each school's official athletics website, copied exactly as printed. We never build an email from a name pattern. If a site blocks automated reading or a page was unclear, the program is marked verify with the official link so you can check it yourself." },
  { q: "Does the app send emails for me?", a: "Not unless you turn it on. The app opens the finished email in your Gmail or mail app and you press Send. Automatic weekly sending from your own Gmail is part of Pro at launch, and you'd have to switch it on." },
  { q: "Can I see if a coach opened my email?", a: "No, and anyone who says so is guessing. Open tracking needs a hidden image, Apple Mail reports opens that never happened, and many school email systems block it. The app tracks what's real: replies, X Seen, calls, camp invites and offers." },
  { q: "Which divisions does it cover?", a: "NCAA D1, D2 and D3, NAIA, and junior colleges (NJCAA, California and the Northwest). Junior college coverage is thinner because many of their sites block automated reading. Those programs keep a link to their official page." },
  { q: "How does the outlook decide Reach, Target or Likely?", a: "It's a Pro feature. It works from the numbers for your position and your GPA, using rough ranges: top fastball, handedness and height for pitchers; exit velo, 60 time, pop time and throwing velo for position players. Coaches also weigh things a number can't show, so use it to balance your list, not to rule schools out." },
  { q: "How does it know how many players are leaving?", a: "It reads each team's latest official roster and counts the players at your position who will be gone before you arrive (sophomores at junior colleges). Rosters older than last season are skipped, and if a team has nobody leaving, the email doesn't bring it up." },
  { q: "Where is my data stored?", a: <>On your device, in the browser or the installed app. There's no account. Export a backup from the Profile tab every week. Details are on the <Link to="privacy" className="underline underline-offset-4">Privacy</Link> page.</> },
  { q: "Who built this?", a: "A class of 2027 right-handed pitcher from Santa Clarita, California. It started as one recruit's own tool and now covers every position." },
];

export function Faq() {
  return (
    <>
      <Intro eyebrow="FAQ" title="Straight answers." />
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1.8fr] md:gap-16">
          <p className="reveal max-w-xs text-[15px] leading-relaxed text-muted-foreground md:sticky md:top-28 md:self-start">
            Don't see yours? The <Link to="how-it-works" className="underline underline-offset-4">How it works</Link> page walks through a full week.
          </p>
          <Accordion type="single" collapsible className="reveal w-full border-t border-foreground/10">
            {QA.map((x, i) => (
              <AccordionItem key={x.q} value={"q" + i} className="border-foreground/10">
                <AccordionTrigger className="py-6 text-left text-[19px] font-medium hover:no-underline sm:text-[21px]">{x.q}</AccordionTrigger>
                <AccordionContent className="pb-6 pr-8 text-[16px] leading-relaxed text-muted-foreground">{x.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
