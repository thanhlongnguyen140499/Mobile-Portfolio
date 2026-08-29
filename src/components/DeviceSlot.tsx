"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { registerSlot } from "@/lib/device-slots";
import { useSceneStore } from "@/lib/scene-store";
import { drawMockScreen, MOCK_BY_SLUG, MOCK_SIZE } from "@/lib/mock-screen";
import { cn } from "@/lib/cn";

function MockScreen({ slug, accent, label }: { slug: string; accent: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) drawMockScreen(ref.current, MOCK_BY_SLUG[slug] ?? "feed", accent);
  }, [slug, accent]);

  return (
    <canvas
      ref={ref}
      width={MOCK_SIZE.width}
      height={MOCK_SIZE.height}
      className="h-full w-full object-cover"
      role="img"
      aria-label={label}
    />
  );
}

export function DeviceSlot({
  slug,
  index,
  screens,
  aspect,
  accent,
  name,
  deviceScreens,
  priority,
}: {
  slug: string;
  /** Position in the featured list; decides which way the device turns. */
  index: number;
  screens: string[];
  aspect: number;
  accent: string;
  name: string;
  /** True only when `screens` are bare captures, safe to map onto a device. */
  deviceScreens: boolean;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useSceneStore((s) => s.active);

  useEffect(() => registerSlot(slug, ref.current), [slug]);

  /* Mirrors the resting pose the 3D device settles into, so the no-WebGL
     version of this section is angled the same way rather than reading as a
     flat, unfinished variant of it. Kept off the measured element — a
     transform there would move the box the 3D gallery aligns to. */
  const facing = index % 2 === 1 ? -1 : 1;
  const tilt = `perspective(1600px) rotateX(3deg) rotateY(${facing * 15}deg) rotateZ(${facing * -2}deg)`;

  const isMock = !deviceScreens;
  const label = screens.length
    ? `${name} — representative interface; this app's published artwork is on its case study`
    : `${name} — representative interface; no screenshots are published for this project`;

  return (
    <div className="mx-auto w-[64%] max-w-[290px] md:w-full md:max-w-[330px]">
      {/* The registered element is exactly the frame box and nothing else: the
          3D gallery centres its device on this rect, so anything else inside
          here — a caption, a margin — would drag the device off the frame. */}
      <div ref={ref} data-device-slot={slug}>
        {/* Hidden, not unmounted, once WebGL takes over: the box has to keep
            its size or the 3D device would have nothing to align to. */}
        <div
          className={cn(
            "transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            active && "opacity-0",
          )}
          style={{ transform: tilt, transformStyle: "preserve-3d" }}
          aria-hidden={active}
        >
          <DeviceFrame aspect={aspect} accent={accent}>
            {deviceScreens && screens[0] ? (
              <Image
                src={screens[0]}
                alt={`${name} — app screen`}
                fill
                sizes="(max-width: 768px) 64vw, 330px"
                priority={priority}
                className="object-cover"
              />
            ) : (
              <MockScreen slug={slug} accent={accent} label={label} />
            )}
          </DeviceFrame>
        </div>
      </div>

      {/* Say it on the page, not only in the alt text — a visitor shouldn't
          have to guess which of these phones is showing the real product. */}
      {isMock && (
        <p className="text-faint mt-5 text-center font-mono text-[0.62rem] tracking-[0.14em] uppercase">
          Representative UI
        </p>
      )}
    </div>
  );
}
