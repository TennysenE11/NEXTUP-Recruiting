import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Intro } from "@/components/site/Intro";
import { Link } from "@/lib/router";

const QA: { q: string; a: React.ReactNode }[] = [
  { q: "What's free and what's Pro?", a: <>Free covers 20 schools with personal emails, two-tap sending and reminders. Pro adds unlimited schools, the outlook, roster insights, goals, charts and X. <Link to="pricing" className="underline underline-offset-4">See pricing</Link>.</> },
  { q: "Does it work for my position?", a: "Yes. Pitchers, catchers, infielders, outfielders and two-way players. Your numbers and the right coach change with you." },
  { q: "Where do coach emails come from?", a: "Each school's official athletics site. Never guessed. Unclear ones are marked verify." },
  { q: "Where do the college logos come from?", a: "Each school's official athletics site. Schools without one show their initials." },
  { q: "Where do cost and test scores come from?", a: "The U.S. Department of Education (IPEDS): yearly cost, tuition, acceptance rate, SAT and ACT ranges, enrollment and graduation rate." },
  { q: "Does it send emails for me?", a: "Only if you turn on automatic sending in Pro. Otherwise you press Send." },
  { q: "Can I see if a coach opened my email?", a: "No. Open tracking is unreliable. The app counts replies, calls and offers." },
  { q: "Which divisions?", a: "NCAA D1, D2, D3, NAIA and junior colleges." },
  { q: "Where is my data?", a: <>On your phone. No account. <Link to="privacy" className="underline underline-offset-4">Privacy</Link>.</> },
  { q: "Who built this?", a: "A 2027 pitcher from Santa Clarita, California." },
];

export function Faq() {
  return (
    <>
      <Intro eyebrow="FAQ" title="Straight answers." />
      <section className="mx-auto max-w-3xl px-5 sm:px-8">
        <Accordion type="single" collapsible className="reveal w-full border-t border-foreground/10">
          {QA.map((x, i) => (
            <AccordionItem key={x.q} value={"q" + i} className="border-foreground/10">
              <AccordionTrigger className="py-6 text-left text-[19px] font-medium hover:no-underline sm:text-[21px]">{x.q}</AccordionTrigger>
              <AccordionContent className="pb-6 pr-8 text-[16px] leading-relaxed text-muted-foreground">{x.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
