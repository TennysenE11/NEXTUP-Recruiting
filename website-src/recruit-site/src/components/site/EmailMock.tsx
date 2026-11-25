// A real email the app writes (Hope International's coach replied to this one with a camp invite).
export function EmailMock() {
  return (
    <div className="relative">
      <div className="absolute -left-3 -top-3 hidden h-full w-full rounded-md border-2 border-dashed border-accent/40 sm:block" aria-hidden />
      <figure className="relative overflow-hidden rounded-md border bg-card shadow-[0_18px_40px_-18px_rgba(15,27,45,0.35)]">
        <div className="flex items-center justify-between border-b bg-secondary px-4 py-2.5">
          <span className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">New message</span>
          <span className="rounded-sm bg-field px-2 py-0.5 text-xs font-semibold text-white">Target fit</span>
        </div>
        <div className="space-y-1 border-b px-4 py-3 text-[13px]">
          <p><span className="text-muted-foreground">To </span>Coach Phillips · pitching and recruiting</p>
          <p className="font-semibold">2027 RHP | 85-87, T88 FB | 4.1 GPA | Hope International</p>
        </div>
        <div className="space-y-3 px-4 py-4 text-[14px] leading-relaxed">
          <p>Coach Phillips,</p>
          <p>My name is Tennysen Enneking, a class of 2027 right-handed pitcher from Valencia High School.</p>
          <p className="rounded-sm border-l-4 border-accent bg-accent/[0.07] px-3 py-2">
            I saw that 11 of the 16 pitchers on your 2027 roster are seniors or grad students, and I want to be ready to compete for innings in 2028.
          </p>
          <p className="text-muted-foreground">Fastball 85-87, T88 · Curveball, cutter, changeup · Video link</p>
        </div>
        <figcaption className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-xs text-muted-foreground">Personal line from the official roster</span>
          <span className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Send in Gmail</span>
        </figcaption>
      </figure>
    </div>
  );
}
