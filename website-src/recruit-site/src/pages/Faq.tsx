import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHead } from "@/components/site/PageHead";
import { Link } from "@/lib/router";

const QA: { q: string; a: React.ReactNode }[] = [
  { q: "Is it really free?", a: "Yes. Everything in the app today is free: the national program list, personal emails, two-tap sending, follow-ups, X messages, goals, charts, the profile score and the outlook. A paid plan will add automation; see Pricing." },
  { q: "Where do the coach emails come from?", a: "From each school's official athletics website, copied exactly as printed. We never build an email from a name pattern. If a site blocks automated reading or a page was unclear, the program is marked verify with the official link so you can check it yourself." },
  { q: "Does the app send emails for me?", a: "The free app never sends anything on its own. It opens the finished email in your Gmail (or mail app) and you press Send. Automatic weekly sending from your own Gmail is part of the planned paid plan, and you'd have to switch it on." },
  { q: "Can I see if a coach opened my email?", a: "No, and we think anyone who says so is guessing. Open tracking needs a hidden image, Apple Mail reports opens that never happened, and many school email systems block it. The app tracks what's real: replies, X Seen, calls, camp invites and offers." },
  { q: "Which divisions does it cover?", a: "NCAA D1, D2 and D3, NAIA, and junior colleges (NJCAA, California and the Northwest). Junior college coverage is thinner because many of their sites block automated reading; those programs keep a link to their official page." },
  { q: "How does the outlook decide Reach, Target or Likely?", a: "From your top fastball, handedness, height and GPA, using rough ranges. Coaches also weigh command, off-speed pitches, projection, video and makeup, so treat it as a way to balance your list, not to rule schools out." },
  { q: "Where is my data stored?", a: <>On your device, in the browser or the installed app. There's no account. Export a backup from the Profile tab every week. Details are on the <Link to="privacy" className="underline">Privacy</Link> page.</> },
  { q: "Who built this?", a: "A class of 2027 right-handed pitcher from Santa Clarita, California, who built it for his own recruiting first." },
];

export function Faq() {
  return (
    <>
      <PageHead kicker="FAQ" title="Straight answers" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {QA.map((x, i) => (
            <AccordionItem key={x.q} value={"q" + i}>
              <AccordionTrigger className="text-left font-display text-xl font-bold uppercase hover:no-underline">{x.q}</AccordionTrigger>
              <AccordionContent className="text-[16px] leading-relaxed text-muted-foreground">{x.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
