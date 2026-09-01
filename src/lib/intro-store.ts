"use client";

import { create } from "zustand";

/**
 * State for the arrival sequence, kept in its own store rather than folded into
 * `scene-store`.
 *
 * Three unrelated trees read it — the loader that owns it, `SmoothScroll` which
 * has to hold Lenis still while it's up, and `Reveal` which must not spend its
 * one-shot enter animations behind an opaque overlay — and none of them are the
 * 3D scene. `scene-store` stays about the scene.
 */
export type IntroPhase =
  /** Overlay is opaque and scrolling is pinned. */
  | "loading"
  /** Overlay is warping out; the page underneath has started its entrance. */
  | "opening"
  /** Overlay is gone and the page owns the viewport. */
  | "done";

/** The readiness signals the gate waits on before it will open. */
export type IntroSignal = "fontsReady" | "imageReady" | "sceneReady";

type IntroStore = {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
  /** 0 → 1, for the readout. Blended by the loader, not by any one signal. */
  progress: number;
  setProgress: (progress: number) => void;
  fontsReady: boolean;
  imageReady: boolean;
  sceneReady: boolean;
  mark: (signal: IntroSignal) => void;
};

export const useIntroStore = create<IntroStore>((set) => ({
  phase: "loading",
  setPhase: (phase) => set({ phase }),
  progress: 0,
  setProgress: (progress) => set({ progress }),
  fontsReady: false,
  imageReady: false,
  sceneReady: false,
  // Latching: a signal only ever goes true. Nothing that lands late — a font
  // that resolves after the gate already timed out — can walk it back.
  mark: (signal) =>
    set((state) =>
      state[signal] ? state : ({ [signal]: true } as Pick<IntroStore, IntroSignal>),
    ),
}));

/**
 * True once the visitor can see and scroll the real page.
 *
 * Everything that animates on arrival keys off this rather than off `"done"`,
 * so the page's entrance runs *with* the overlay's exit rather than after it.
 */
export function introStarted(state: { phase: IntroPhase }) {
  return state.phase !== "loading";
}
