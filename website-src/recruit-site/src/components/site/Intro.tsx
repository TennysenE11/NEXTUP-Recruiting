// Page opener used by every inner page: small label, tall gradient title, one plain lead.
export function Intro({ eyebrow, title, lead, children }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mx-auto max-w-6xl px-5 pb-14 pt-12 text-center sm:px-8 md:pb-20 md:pt-20">
      <p className="eyebrow reveal justify-center">{eyebrow}</p>
      <h1 className="display grad reveal mx-auto mt-5 max-w-4xl text-[54px] sm:text-[80px] lg:text-[96px]" style={{ ["--d" as string]: "80ms" }}>{title}</h1>
      {lead && <p className="reveal mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground" style={{ ["--d" as string]: "160ms" }}>{lead}</p>}
      {children && <div className="reveal mt-9" style={{ ["--d" as string]: "240ms" }}>{children}</div>}
    </header>
  );
}
