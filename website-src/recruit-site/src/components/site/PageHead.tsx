export function PageHead({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <header className="grain border-b">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 md:pt-16">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">{kicker}</p>
        <h1 className="mt-3 max-w-4xl text-[40px] font-extrabold uppercase leading-[0.95] sm:text-6xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{lead}</p>}
      </div>
    </header>
  );
}
