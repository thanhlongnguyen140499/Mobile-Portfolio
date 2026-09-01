"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { introStarted, useIntroStore } from "@/lib/intro-store";

/**
 * A restrained enter animation: a short rise and fade, once, on first sight.
 *
 * Deliberately not applied to device slots — the 3D gallery positions itself
 * from those elements' bounding boxes, and animating a slot would drag the
 * device along with it.
 *
 * Gated on the arrival overlay. This used to be a plain `whileInView`, which
 * fires against the real viewport regardless of what is painted over it: every
 * section inside the first screenful spent its one-shot enter animation behind
 * an opaque loader, and the visitor met a page that had already finished
 * animating. Holding at `hidden` until the intro starts opening costs nothing
 * and is the difference between the page arriving and the page just being
 * there.
 */
const VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  /* An explicit `animate` rather than `whileInView`, because the in-view test
     and the intro gate have to be combined — and `once` here is the ref's own
     latch, so a section that scrolled by during the intro still animates when
     it next comes into view. */
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const started = useIntroStore(introStarted);
  const Tag = as === "li" ? motion.li : motion.div;

  if (reduce) {
    return as === "li" ? (
      <li className={className}>{children}</li>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      variants={VARIANTS}
      initial="hidden"
      animate={inView && started ? "shown" : "hidden"}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Tag>
  );
}
