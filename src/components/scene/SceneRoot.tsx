"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useTier } from "@/lib/tier";
import { useIntroStore } from "@/lib/intro-store";
import type { DeviceSpec } from "@/components/scene/Scene";

/**
 * three.js and the R3F stack are ~600KB gzipped. Loading them lazily from a
 * client component keeps them out of the initial bundle, so the LCP is the
 * hero text and the first screenshot — not a WebGL context.
 *
 * `ssr: false` is only legal inside a Client Component, which is the whole
 * reason this wrapper exists.
 */
const Scene = dynamic(() => import("@/components/scene/Scene"), { ssr: false });

export function SceneRoot({ devices }: { devices: DeviceSpec[] }) {
  const tier = useTier();

  /* Release the arrival overlay on the branch below, which returns null and so
     will never draw the frame <ReadySignal> would otherwise report. Without
     this the loader waits out its full timeout on every machine with no WebGL. */
  useEffect(() => {
    if (tier.ready && !tier.webgl) useIntroStore.getState().mark("sceneReady");
  }, [tier.ready, tier.webgl]);

  // No WebGL, or capabilities not resolved yet: the page keeps its CSS device
  // frames and loses nothing but the depth.
  if (!tier.ready || !tier.webgl) return null;

  return (
    <Suspense fallback={null}>
      <Scene devices={devices} tier={tier} />
    </Suspense>
  );
}
