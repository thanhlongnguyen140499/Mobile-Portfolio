import { cn } from "@/lib/cn";

export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="font-mono text-[0.7rem] tracking-[0.22em] text-faint uppercase">
        {index}
      </span>
      <span className="font-mono text-[0.7rem] tracking-[0.22em] text-muted uppercase">
        {children}
      </span>
      <span className="bg-line h-px flex-1" aria-hidden />
    </div>
  );
}
