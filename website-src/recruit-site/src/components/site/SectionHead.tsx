// Numbered section opener: "01 · LABEL", a tall gradient headline and one short line.
export function SectionHead({ n, label, title, lead, className = "" }: { n: string; label: string; title: React.ReactNode; lead?: React.ReactNode; className?: string }) {
  return (
    <div className={"mx-auto max-w-3xl text-center " + className}>
      <p className="eyebrow reveal justify-center"><span>{n}</span><span className="sep">·</span><span>{label}</span></p>
      <h2 className="display grad reveal mt-5 text-[46px] sm:text-[66px] lg:text-[78px]" style={{ ["--d" as string]: "80ms" }}>{title}</h2>
      {lead && <p className="reveal mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]" style={{ ["--d" as string]: "160ms" }}>{lead}</p>}
    </div>
  );
}
