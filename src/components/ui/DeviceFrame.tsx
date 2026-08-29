import { cn } from "@/lib/cn";

/**
 * A CSS device frame wrapped around whatever screen content it's given.
 *
 * This is the no-WebGL fallback for the 3D gallery and the frame used in case
 * studies, so it has to stand on its own — a visitor who never loads the canvas
 * should still see the products properly presented.
 */
export function DeviceFrame({
  aspect = 0.5625,
  accent,
  className,
  children,
}: {
  aspect?: number;
  accent?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // The radii are elliptical pairs (x%/y%) tuned so the *rendered* corner is
  // circular at a 9:16 screen — a single percentage would curve far harder
  // vertically and eat the app's own tab bar.
  return (
    <div
      className={cn(
        "relative rounded-[9.5%/5.34%] bg-gradient-to-b from-[#42454c] via-[#15171b] to-[#2c2f36] p-[1.1%]",
        className,
      )}
      style={{
        boxShadow: accent
          ? `0 40px 90px -30px ${accent}55, 0 18px 50px -20px rgba(0,0,0,0.9)`
          : "0 18px 50px -20px rgba(0,0,0,0.9)",
      }}
    >
      <div
        className="bg-ink-sunken relative overflow-hidden rounded-[7.6%/4.27%]"
        style={{ aspectRatio: String(aspect) }}
      >
        {children}
        {/* Glass sheen — a flat screenshot reads as paper without it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
        />
      </div>
    </div>
  );
}
