"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { profile } from "@/data/profile";
import { useIntroStore } from "@/lib/intro-store";
import { prefersReducedMotion } from "@/lib/tier";
import { createStarfield, type Starfield } from "@/components/intro/starfield";
import { cn } from "@/lib/cn";

/**
 * The arrival sequence.
 *
 * It exists for a reason that isn't decoration. The hero → work device flight
 * in `scene/Device.tsx` is driven by scroll *position*, not by a timeline:
 *
 *     t = smoothstep(mapRange(scrollState.y, 0, size.height * 0.6, 0, 1))
 *
 * The WebGL scene arrives late — a lazily imported ~1.1MB chunk, then every
 * screenshot uploaded as a texture — so a visitor who scrolls while it loads
 * has already pushed `scrollState.y` past that whole input range. The scene's
 * very first frame then computes t = 1 and the devices are simply born docked;
 * the flight never happens and cannot be replayed. `Reveal`'s `once: true`
 * enter animations burn the same way, firing under a page nobody is watching.
 *
 * Holding the viewport at the top until the scene has actually drawn a frame is
 * therefore the fix, and the loader is what makes that hold honest rather than
 * an unexplained frozen page.
 */

/*
 * The budgets below are measured from *navigation start*, not from mount —
 * `performance.now()`'s origin. On a slow connection the visitor has already
 * been looking at the server-rendered overlay for a second or two before React
 * gets here, and charging them a fresh full budget on top of that is how a
 * considerate loader turns into a long one.
 */

/** Never flash: below this the loader reads as a glitch, not a transition. */
const MIN_MS = 900;
/** Always open: a driver that never draws a frame must not trap anyone. */
const MAX_MS = 4000;
/**
 * ...but always hold at least this long from mount, whatever the budget says.
 * A page that hydrated late has spent none of that time loading the scene, and
 * opening the gate immediately would hand back the exact bug this component
 * exists to prevent.
 */
const MIN_HOLD_MS = 1400;
const EXIT_MS = 700;
/** Repeat visits in the same tab get a transition, not a performance. */
const SHORT_HOLD_MS = 150;
const SHORT_EXIT_MS = 400;
const SESSION_KEY = "intro:played";

const STATUS = [
  { until: 0.3, text: "Establishing orbit" },
  { until: 0.62, text: "Loading the work" },
  { until: 0.99, text: "Calibrating the studio" },
  { until: Infinity, text: "Welcome" },
];

function statusFor(progress: number) {
  return STATUS.find((s) => progress < s.until)!.text;
}

export function Preloader() {
  const phase = useIntroStore((s) => s.phase);
  const progress = useIntroStore((s) => s.progress);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Starfield | null>(null);
  const openedRef = useRef(false);
  /** Repeat visit or reduced motion: resolved at mount, read by `open`. */
  const shortRef = useRef(false);

  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;

    const store = useIntroStore.getState();
    store.setProgress(1);
    store.setPhase("opening");
    fieldRef.current?.setWarp(1);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private mode, or storage disabled. The intro just plays in full again.
    }

    window.setTimeout(
      () => useIntroStore.getState().setPhase("done"),
      shortRef.current ? SHORT_EXIT_MS : EXIT_MS,
    );
  }, []);

  /*
   * Everything in here has to happen before the browser paints, which is why
   * it's a layout effect: by the time a passive effect ran, a visitor on a
   * trackpad could already have flicked the page down.
   */
  useLayoutEffect(() => {
    const root = document.documentElement;

    /* Re-assert the attribute the inline script in <head> set. In development
       React's StrictMode remount resets <html> to only the attributes it owns
       from JSX, wiping it — a no-op in production. */
    root.dataset.intro = "loading";

    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Ignore: treat an unreadable store as a first visit.
    }
    shortRef.current = played || prefersReducedMotion();

    /* A refresh from halfway down the page is the original bug in miniature —
       the browser restores scrollY before the scene exists, so the device
       flight is over before it starts. Only when there's no hash, or a
       deep link to /#work would be silently swallowed. */
    if (!window.location.hash) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    if (shortRef.current) {
      const id = window.setTimeout(open, SHORT_HOLD_MS);
      return () => window.clearTimeout(id);
    }

    /* One loop for both jobs: it has to run every frame for the readout
       anyway, so the gate check rides along rather than duplicating timers. */
    const deadline = Math.max(MAX_MS, performance.now() + MIN_HOLD_MS);
    let frame = requestAnimationFrame(function tick() {
      const t = performance.now();
      const store = useIntroStore.getState();
      const ready = store.fontsReady && store.imageReady && store.sceneReady;

      /* Weighted by how much of the wait each milestone actually represents —
         the scene is the long pole by an order of magnitude. Blended with an
         eased synthetic ramp so the bar never sits at zero while a signal is
         pending, and capped below 1 until every signal is in, so it can't
         claim to be finished and then keep the visitor waiting. */
      const real =
        (store.fontsReady ? 0.2 : 0) +
        (store.imageReady ? 0.2 : 0) +
        (store.sceneReady ? 0.6 : 0);
      const synthetic = 0.92 * (1 - Math.exp(-t / (MAX_MS * 0.34)));
      const next = ready ? 1 : Math.min(0.92, Math.max(real, synthetic));
      if (Math.abs(next - store.progress) > 0.004) store.setProgress(next);

      if ((ready && t >= MIN_MS) || t >= deadline) {
        open();
        return;
      }
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  /* Keep the phase on <html> so server-rendered sections can run their own
     entrance from CSS without being converted into client components. */
  useEffect(() => {
    document.documentElement.dataset.intro = phase;
    /* Hand scroll restoration back to the browser once we're out of the way —
       the layout effect only takes it to stop a mid-page refresh from starting
       the visitor past the device flight. */
    if (phase === "done") history.scrollRestoration = "auto";
    return () => {
      delete document.documentElement.dataset.intro;
    };
  }, [phase]);

  /*
   * The scroll hold. Three locks, because each one leaks on its own: Lenis is
   * never constructed under reduced motion (SmoothScroll.tsx), `overflow:
   * hidden` doesn't stop iOS rubber-banding, and neither touches the smooth
   * scroller's own rAF. `SmoothScroll` handles Lenis; these two are the rest.
   */
  useEffect(() => {
    if (phase === "done") return;

    const root = document.documentElement;
    const prevRoot = root.style.overflow;
    const prevBody = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const block = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", block, { passive: false });

    /* Nothing behind an opaque overlay should be tabbable. Recorded per
       element so we only clear what we set. */
    const inerted = [...document.body.children].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el.id !== "intro" && !el.inert,
    );
    for (const el of inerted) el.inert = true;

    return () => {
      root.style.overflow = prevRoot;
      document.body.style.overflow = prevBody;
      document.removeEventListener("touchmove", block);
      for (const el of inerted) el.inert = false;
    };
  }, [phase]);

  // --- readiness signals -------------------------------------------------
  useEffect(() => {
    const { mark } = useIntroStore.getState();

    /* Three next/font families load with display: swap, and Bricolage carries
       four weights — without this the name reflows mid-intro. */
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => mark("fontsReady"), () => mark("fontsReady"));
    } else {
      mark("fontsReady");
    }

    /* The hero screenshot. Routes with no device slots (a case study) have
       nothing to wait for, so the signal lands immediately. */
    const img = document.querySelector<HTMLImageElement>("[data-device-slot] img");
    if (!img) {
      mark("imageReady");
    } else if (img.complete) {
      mark("imageReady");
    } else {
      const done = () => mark("imageReady");
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }, []);

  const scene = useIntroStore((s) => s.sceneReady);
  useEffect(() => {
    /* Belt and braces: if the scene signal hasn't landed by the time the hard
       cap would fire anyway, stop pretending we're still waiting on it — the
       readout should not sit at 92% for a second with nothing moving. */
    if (scene) return;
    const wait = Math.max(MIN_HOLD_MS, MAX_MS - performance.now());
    const id = window.setTimeout(() => useIntroStore.getState().mark("sceneReady"), wait);
    return () => window.clearTimeout(id);
  }, [scene]);

  // --- starfield ---------------------------------------------------------
  useEffect(() => {
    if (phase === "done" || !canvasRef.current) return;
    const field = createStarfield(canvasRef.current, { reduced: prefersReducedMotion() });
    fieldRef.current = field;
    // The gate can open before this mounts on a warm cache; don't lose the warp.
    if (openedRef.current) field.setWarp(1);
    return () => {
      field.destroy();
      fieldRef.current = null;
    };
  }, [phase]);

  if (phase === "done") return null;

  const pct = Math.round(progress * 100);
  const opening = phase === "opening";

  return (
    <div
      id="intro"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        "bg-ink fixed inset-0 z-200 flex items-center justify-center overflow-hidden",
        "transition-[opacity,transform,filter] ease-[cubic-bezier(0.65,0,0.35,1)]",
        opening
          ? "pointer-events-none scale-[1.12] opacity-0 blur-[6px]"
          : "scale-100 opacity-100 blur-0",
      )}
      style={{ transitionDuration: `${opening ? EXIT_MS : 0}ms` }}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />

      <div
        className={cn(
          "relative flex w-[min(26rem,78vw)] flex-col items-center text-center",
          "transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          opening && "-translate-y-3 opacity-0",
        )}
      >
        <p className="text-faint mb-5 font-mono text-[0.62rem] tracking-[0.26em] uppercase">
          {profile.role}
        </p>

        <h1 className="font-display text-bone text-[clamp(1.6rem,4vw,2.4rem)] leading-none font-semibold tracking-[-0.03em]">
          {profile.alternateName}
        </h1>

        <div className="mt-9 flex w-full items-center gap-4">
          <div className="bg-line h-px flex-1 overflow-hidden">
            <div
              className="bg-accent h-full origin-left transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          <span className="text-muted w-[3.5ch] text-right font-mono text-[0.68rem] tabular-nums">
            {pct}
          </span>
        </div>

        <p className="text-faint mt-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase">
          {statusFor(progress)}
        </p>

        <button
          type="button"
          onClick={open}
          className="text-faint hover:text-bone mt-10 rounded-full px-3 py-1 font-mono text-[0.6rem] tracking-[0.18em] uppercase transition-colors"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
