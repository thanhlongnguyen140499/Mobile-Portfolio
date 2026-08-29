"use client";

import { useSyncExternalStore } from "react";
import { profile } from "@/data/profile";
import { cn } from "@/lib/cn";

const address = `${profile.email.user}@${profile.email.domain}`;
const noop = () => () => {};

/**
 * The address is stored split in `profile` and only joined in the browser, so
 * it never sits in the served HTML as one scrapable string.
 *
 * useSyncExternalStore rather than an effect: the server snapshot is null and
 * the client snapshot is the real address, which is exactly the "differs
 * between server and client" case it exists for — and it avoids the extra
 * render an effect-then-setState would cost.
 */
export function ObfuscatedEmail({ className }: { className?: string }) {
  const resolved = useSyncExternalStore(
    noop,
    () => address,
    () => null,
  );

  if (!resolved) {
    return (
      <span className={className}>
        {profile.email.user} <span aria-hidden>[at]</span> {profile.email.domain}
      </span>
    );
  }

  return (
    <a
      href={`mailto:${resolved}`}
      className={cn("hover:text-accent transition-colors", className)}
    >
      {resolved}
    </a>
  );
}
