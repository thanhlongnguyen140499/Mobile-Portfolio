"use client";

import { useEffect, useState } from "react";

export type Tier = {
  /** Whether a WebGL2 context can actually be created here. */
  webgl: boolean;
  /** Visitor asked for less motion. Never override this. */
  reducedMotion: boolean;
  /** Coarse capability bucket, used to gate postprocessing and DPR. */
  level: "high" | "low";
  /** Resolved once on the client; false during SSR and the first paint. */
  ready: boolean;
};

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function detectWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    // Release it immediately — some drivers cap the number of live contexts.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function detectLevel(): "high" | "low" {
  if (typeof navigator === "undefined") return "low";
  const cores = navigator.hardwareConcurrency ?? 2;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  // Phones do fine with the scene itself; it's the postprocessing pass that
  // cooks them, so they start at "low" and stay there.
  if (coarse) return "low";
  return cores >= 8 && mem >= 8 ? "high" : "low";
}

/**
 * The scene never renders on the server, so this resolving on the client is
 * fine — but `ready` gates anything that would otherwise flash the wrong state.
 */
export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>({
    webgl: false,
    reducedMotion: false,
    level: "low",
    ready: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resolve = () =>
      setTier({
        webgl: detectWebGL(),
        reducedMotion: mq.matches,
        level: detectLevel(),
        ready: true,
      });
    resolve();
    mq.addEventListener("change", resolve);
    return () => mq.removeEventListener("change", resolve);
  }, []);

  return tier;
}
