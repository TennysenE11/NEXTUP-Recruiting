import { cn } from "@/lib/utils";

// A plain phone frame around a real screenshot of the app.
export function Phone({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("relative aspect-[390/844] w-full rounded-[2.6rem] bg-[#141413] p-[9px] shadow-[0_30px_60px_-30px_rgba(20,20,19,0.45),0_12px_24px_-16px_rgba(20,20,19,0.3)]", className)} style={style}>
      <div className="relative h-full w-full overflow-hidden rounded-[2.05rem] bg-white">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block h-full w-full object-cover object-top" />
      </div>
    </div>
  );
}
