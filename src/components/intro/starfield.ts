/**
 * A galaxy field on a plain 2D canvas — no three.js, on purpose.
 *
 * This exists to cover the window in which the ~1.1MB WebGL chunk downloads,
 * so it cannot itself live in that chunk: a loader that arrives with the
 * payload it's covering has no reason to exist. Everything here is arithmetic
 * and `CanvasRenderingContext2D`, which means it paints on the first frame the
 * browser gives it.
 */

export type Starfield = {
  /**
   * 0 → 1. Stretches the stars into streaks and accelerates the drift, for the
   * exit. Eased internally, so callers can snap it to 1 and let it ramp.
   */
  setWarp: (v: number) => void;
  destroy: () => void;
};

type Star = { x: number; y: number; z: number; tint: number };

const STAR_COUNT = 620;
/** Depth units per second at rest. Stars spawn near z=1 and fall toward z=0. */
const DRIFT = 0.035;
/** Warp multiplies the drift by up to this much. */
const WARP_BOOST = 9;
/** Retina is worth it here — these are hairlines — but 3x is not. */
const MAX_DPR = 2;

/**
 * Nebula clouds, in the accent tints already declared in globals.css `@theme`
 * (--color-accent, --color-wispr, --color-news) so the intro and the page are
 * lit by the same palette. Positions are fractions of the smaller viewport
 * axis, offset from centre.
 */
const NEBULA = [
  { rgb: "76, 201, 240", x: -0.3, y: -0.24, radius: 0.95, alpha: 0.36, orbit: 0.09 },
  { rgb: "59, 169, 212", x: 0.34, y: 0.26, radius: 0.78, alpha: 0.27, orbit: -0.07 },
  { rgb: "224, 161, 58", x: 0.14, y: -0.36, radius: 0.5, alpha: 0.16, orbit: 0.13 },
];

function spawn(star: Star, scatter: boolean) {
  const angle = Math.random() * Math.PI * 2;
  // sqrt, not a raw random: without it the disc clumps everything at the
  // centre and the field reads as a pinhole rather than a sky.
  const radius = Math.sqrt(Math.random());
  star.x = Math.cos(angle) * radius;
  star.y = Math.sin(angle) * radius;
  /* On the first fill, scatter through the whole depth so the field is already
     populated on frame one — a loader that starts empty and fills up looks
     broken. After that they always enter from the back. */
  star.z = scatter ? 0.06 + Math.random() * 0.94 : 0.92 + Math.random() * 0.3;
  star.tint = Math.random();
}

export function createStarfield(
  canvas: HTMLCanvasElement,
  { reduced }: { reduced: boolean },
): Starfield {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return { setWarp: () => {}, destroy: () => {} };
  /* Re-declared with an explicit type rather than relying on the narrowing
     above: `draw` is hoisted, and TypeScript won't carry a narrowed union into
     a hoisted function declaration. */
  const ctx: CanvasRenderingContext2D = context;

  const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
    const star = { x: 0, y: 0, z: 1, tint: 0 };
    spawn(star, true);
    return star;
  });

  let width = 0;
  let height = 0;
  let warp = 0;
  let targetWarp = 0;
  let elapsed = 0;
  let frame = 0;
  let last = 0;

  const resize = () => {
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) draw(0);
  };

  function draw(dt: number) {
    const cx = width / 2;
    const cy = height / 2;
    /* One world unit of x/y at z=1 spans this many pixels. Half the larger
       axis, so the disc of stars at the far plane is inscribed in the viewport
       rather than mostly outside it — at 0.62 the majority of the field spawned
       off-screen and was recycled before it was ever drawn, which is why the
       sky looked empty. */
    const spread = Math.max(width, height) * 0.5;
    const spin = elapsed * 0.03;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#08090b";
    ctx.fillRect(0, 0, width, height);

    // --- nebula ---------------------------------------------------------
    // Additive, so the clouds pool where they overlap instead of muddying.
    ctx.globalCompositeOperation = "lighter";
    const base = Math.min(width, height);
    for (const cloud of NEBULA) {
      const drift = elapsed * cloud.orbit;
      const px = cx + (cloud.x + Math.cos(drift) * 0.035) * base;
      const py = cy + (cloud.y + Math.sin(drift * 0.8) * 0.035) * base;
      const r = cloud.radius * base * (0.92 + Math.sin(elapsed * 0.22 + cloud.orbit * 9) * 0.08);
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, r);
      // Fading to a transparent *tint* rather than to transparent black keeps
      // the cloud edge from turning grey as it dissolves.
      gradient.addColorStop(0, `rgba(${cloud.rgb}, ${cloud.alpha})`);
      gradient.addColorStop(0.45, `rgba(${cloud.rgb}, ${cloud.alpha * 0.32})`);
      gradient.addColorStop(1, `rgba(${cloud.rgb}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // --- stars ----------------------------------------------------------
    const speed = DRIFT * (1 + warp * WARP_BOOST);
    const trail = warp * 0.34;

    for (const star of stars) {
      if (dt > 0) star.z -= speed * dt;
      if (star.z <= 0.025) {
        spawn(star, false);
        continue;
      }

      // Rotating at projection time rather than mutating x/y keeps the field
      // turning like one galaxy instead of each star wandering off its radius.
      const rx = star.x * cos - star.y * sin;
      const ry = star.x * sin + star.y * cos;

      const k = 1 / star.z;
      const px = cx + rx * k * spread;
      const py = cy + ry * k * spread;
      if (px < -80 || px > width + 80 || py < -80 || py > height + 80) {
        spawn(star, false);
        continue;
      }

      /* Near stars are big and bright, far ones are dust — but dust that can
         still be seen. A curve that runs all the way to zero at the far plane
         spends most of the field's population on stars nobody can make out, so
         the floor is deliberately well above nothing. */
      const depth = 1 - star.z;
      const size = 0.45 + Math.pow(depth, 1.7) * 2.4;
      const alpha = Math.min(1, 0.18 + depth * 1.15);
      // A minority get the accent tint; a field of pure white reads as static.
      const colour =
        star.tint > 0.82
          ? `rgba(150, 214, 245, ${alpha})`
          : star.tint > 0.7
            ? `rgba(232, 200, 158, ${alpha * 0.9})`
            : `rgba(255, 255, 255, ${alpha})`;

      if (trail > 0.01) {
        // Where this star was `trail` depth-units ago — the streak is just the
        // segment between then and now, which is exactly what a long exposure
        // of an accelerating field looks like.
        const tz = star.z + trail;
        const tk = 1 / tz;
        ctx.strokeStyle = colour;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx + rx * tk * spread, cy + ry * tk * spread);
        ctx.lineTo(px, py);
        ctx.stroke();
      } else if (size < 1.1) {
        // A sub-pixel dot is a rect. Skipping the path machinery for the bulk
        // of the field is most of the cost of drawing it.
        ctx.fillStyle = colour;
        ctx.fillRect(px, py, size * 2, size * 2);
      } else {
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- vignette -------------------------------------------------------
    // Pulls the edges back down to the page's own ink so the overlay doesn't
    // end at a visible rectangle.
    ctx.globalCompositeOperation = "source-over";
    const vignette = ctx.createRadialGradient(cx, cy, base * 0.35, cx, cy, base * 0.95);
    vignette.addColorStop(0, "rgba(8, 9, 11, 0)");
    vignette.addColorStop(1, "rgba(8, 9, 11, 0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    elapsed += dt;
    // Ease toward the target so a snap to 1 reads as acceleration, not a cut.
    warp += (targetWarp - warp) * (1 - Math.exp(-3.4 * dt));
    draw(dt);
    frame = requestAnimationFrame(tick);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  // Reduced motion gets the same picture, held still: one frame, no loop.
  if (!reduced) frame = requestAnimationFrame(tick);

  return {
    setWarp: (v) => {
      targetWarp = reduced ? 0 : v;
    },
    destroy: () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    },
  };
}
