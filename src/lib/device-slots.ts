"use client";

/**
 * Registry of the DOM boxes the 3D devices align to.
 *
 * The gallery doesn't invent its own layout — it reads these rects and projects
 * each one into world space, so the WebGL and no-WebGL versions of the page put
 * every device in exactly the same place. Layout stays a CSS problem.
 */
/**
 * Reserved key for the hero cluster's anchor box. It goes through the same
 * registry as the devices so React re-registers it on every mount — a cached
 * `document.querySelector` result goes stale the moment the page it came from
 * unmounts, and a detached node measures as all zeros.
 */
export const HERO_ANCHOR = "__hero-anchor__";

const slots = new Map<string, HTMLElement>();
const listeners = new Set<() => void>();

export function registerSlot(slug: string, el: HTMLElement | null) {
  if (!el) return () => {};
  slots.set(slug, el);
  for (const fn of listeners) fn();
  return () => {
    slots.delete(slug);
    for (const fn of listeners) fn();
  };
}

export function getSlot(slug: string) {
  return slots.get(slug) ?? null;
}

export function onSlotsChanged(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Whether any *device* is on the page. The hero anchor alone doesn't count. */
export function hasSlots() {
  for (const key of slots.keys()) if (key !== HERO_ANCHOR) return true;
  return false;
}
