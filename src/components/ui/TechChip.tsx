import { cn } from "@/lib/cn";

export function TechChip({
  children,
  className,
  dim,
}: {
  children: React.ReactNode;
  className?: string;
  dim?: boolean;
}) {
  return (
    <span
      className={cn(
        "border-line inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.7rem] tracking-wide transition-colors duration-300",
        dim ? "text-faint border-transparent" : "text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
