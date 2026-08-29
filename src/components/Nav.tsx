"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#craft", label: "Craft" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
];

export function Nav() {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        lifted && "border-line bg-ink/72 border-b backdrop-blur-xl",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-6 md:px-10"
      >
        <Link
          href="/"
          aria-label={`${profile.name} — home`}
          className="group flex items-baseline gap-2"
        >
          <span className="font-display text-bone text-[0.95rem] font-semibold tracking-tight">
            {profile.name}
          </span>
          <span className="text-faint hidden font-mono text-[0.65rem] tracking-[0.18em] uppercase sm:inline">
            {profile.role}
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-muted hover:text-bone rounded-full px-3 py-2 font-mono text-[0.7rem] tracking-[0.14em] uppercase transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="border-line hover:border-line-strong hover:bg-ink-raised text-bone rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.14em] uppercase transition-colors"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
