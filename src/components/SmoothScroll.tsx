"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { publishScroll } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/tier";
import { useIntroStore } from "@/lib/intro-store";

/** Whether the arrival overlay still owns the viewport. */
function introHolding() {
  return useIntroStore.getState().phase !== "done";
}

/**
 * Drives page scrolling and publishes scroll state for the 3D scene.
 *
 * Visitors who asked for reduced motion get native scrolling — Lenis is never
 * constructed — but scroll state is still published so the scene can hold the
 * correct static pose for wherever they are on the page.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  /*
   * Reconcile Lenis with the router at every navigation.
   *
   * Both want to own window.scrollY. Click a link mid-flick and Lenis is still
   * animating toward, say, 4200 on a page that was 9105 tall; the router then
   * renders a 1997-tall page and scrolls to the top, and Lenis's next frame
   * writes 4200 straight back over it. The browser clamps that to the new
   * limit, so the page opens pinned to its own bottom.
   *
   * Freeze Lenis first — reading window.scrollY without doing so just reads
   * back the value Lenis has already clobbered, which is self-fulfilling. With
   * it frozen the router's scroll survives, and after a few frames (long
   * enough for the new page to lay out) Lenis is handed the real offset and the
   * height it hasn't measured yet, then resumes.
   */
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.stop();

    let frame = 0;
    let remaining = 4;
    const settle = () => {
      lenis.resize();
      if (--remaining > 0) {
        frame = requestAnimationFrame(settle);
        return;
      }
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      // Not while the intro is holding the viewport — see the effect below.
      if (!introHolding()) lenis.start();
    };
    frame = requestAnimationFrame(settle);

    return () => {
      cancelAnimationFrame(frame);
      if (!introHolding()) lenis.start();
    };
  }, [pathname]);

  /*
   * Hold the scroller while the arrival overlay is up.
   *
   * `overflow: hidden` alone doesn't cover this: Lenis drives scrolling from
   * its own rAF and would keep writing positions behind an opaque overlay. The
   * device flight in scene/Device.tsx is scroll-position-driven, so any motion
   * during the load spends the animation before anyone can see it.
   */
  useEffect(
    () =>
      useIntroStore.subscribe((state) => {
        const lenis = lenisRef.current;
        if (!lenis) return;
        if (state.phase === "done") lenis.start();
        else lenis.stop();
      }),
    [],
  );

  useEffect(() => {
    const reduced = prefersReducedMotion();

    if (reduced) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        publishScroll({
          y: window.scrollY,
          progress: max > 0 ? window.scrollY / max : 0,
          velocity: 0,
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const lenis = new Lenis({
      duration: 1.1,
      // Gentle expo-out: fast to respond, settles without overshoot.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native momentum on touch already feels right; hijacking it doesn't.
      syncTouch: false,
      // Kills inertia when an <a> is clicked. It doesn't cover router.push()
      // from the 3D devices, which is what the pathname effect above is for.
      stopInertiaOnNavigate: true,
    });
    lenisRef.current = lenis;
    // Mounted mid-intro on a cold load: start held, and let the subscription
    // above release it. Lenis is constructed after <Preloader> has already set
    // the phase, so reading it once here is enough.
    if (introHolding()) lenis.stop();

    lenis.on("scroll", ({ scroll, progress, velocity }) => {
      publishScroll({ y: scroll, progress, velocity });
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Anchor links have to go through Lenis or they fight the smooth scroll.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")!.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -24 });
      /* preventDefault also suppresses the URL update a native anchor would do,
         which leaves the address bar pointing at whichever section was clicked
         first. replaceState keeps it honest and shareable without pushing a
         history entry per section — back should leave the page, not step back
         through every heading the visitor clicked. */
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
