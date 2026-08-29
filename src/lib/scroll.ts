/**
 * Scroll state lives outside React on purpose.
 *
 * The 3D scene samples it every frame inside useFrame; routing it through
 * React state would re-render the tree 60 times a second for no reason. React
 * components that genuinely need to re-render (the active project label) can
 * subscribe explicitly.
 */
export type ScrollState = {
  /** Pixels from the top of the document. */
  y: number;
  /** 0 → 1 across the scrollable height of the document. */
  progress: number;
  /** Pixels per frame, signed. Used for motion trails and tilt. */
  velocity: number;
};

export const scrollState: ScrollState = { y: 0, progress: 0, velocity: 0 };

type Listener = (s: ScrollState) => void;
const listeners = new Set<Listener>();

export function subscribeScroll(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function publishScroll(next: Partial<ScrollState>) {
  Object.assign(scrollState, next);
  for (const fn of listeners) fn(scrollState);
}

/** Maps a value from one range to another, clamped. */
export function mapRange(v: number, inMin: number, inMax: number, outMin = 0, outMax = 1) {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/**
 * Frame-rate independent damping. Standard exponential approach — at 60fps
 * with lambda 5 this closes ~8% of the gap per frame, and stays identical on a
 * 120Hz display.
 */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
