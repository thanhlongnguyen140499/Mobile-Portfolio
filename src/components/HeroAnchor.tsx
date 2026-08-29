"use client";

import { useEffect, useRef } from "react";
import { HERO_ANCHOR, registerSlot } from "@/lib/device-slots";

/**
 * Empty by design: the 3D gallery reads this box to place the hero device
 * cluster, so the cluster is positioned by CSS like everything else and simply
 * isn't there when WebGL is unavailable.
 *
 * It registers itself rather than being looked up, because the canvas lives in
 * the root layout and outlives this element — navigating to a case study and
 * back replaces the node, and anything holding the old one measures zeros.
 */
export function HeroAnchor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => registerSlot(HERO_ANCHOR, ref.current), []);

  return (
    <div
      ref={ref}
      data-hero-anchor
      aria-hidden
      className="pointer-events-none absolute top-[16%] right-[3%] hidden h-[56%] w-[42%] md:block"
    />
  );
}
