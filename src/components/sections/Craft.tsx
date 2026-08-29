"use client";

import { useMemo, useState } from "react";
import { skillGroups, canonicalSkill } from "@/data/skills";
import { projects } from "@/data/projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";

export function Craft() {
  /** Skill → the projects that actually used it, matched on canonical names. */
  const usage = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const group of skillGroups) {
      for (const skill of group.items) {
        const key = canonicalSkill(skill);
        map.set(
          skill,
          projects
            .filter((p) => p.tech.some((t) => canonicalSkill(t) === key))
            .map((p) => p.slug),
        );
      }
    }
    return map;
  }, []);

  const [active, setActive] = useState<string | null>(null);
  const lit = active ? (usage.get(active) ?? []) : null;

  return (
    <section id="craft" className="px-6 py-24 md:px-10 md:py-section">
      <div className="mx-auto max-w-[88rem]">
        <SectionLabel index="02">Craft</SectionLabel>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-muted max-w-xl text-pretty text-[clamp(1.1rem,2.2vw,1.6rem)] leading-snug">
              Five years across the stack, but the centre of gravity is iOS. Hover anything to see
              where I&rsquo;ve actually shipped it.
            </p>

            <div className="mt-12 space-y-8">
              {skillGroups.map((group) => (
                <div key={group.label} className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <h3 className="text-faint pt-1.5 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
                    {group.label}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((skill) => {
                      const count = usage.get(skill)?.length ?? 0;
                      return (
                        <li key={skill}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(skill)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(skill)}
                            onBlur={() => setActive(null)}
                            aria-describedby="craft-usage"
                            className={cn(
                              "border-line rounded-full border px-3 py-1.5 font-mono text-[0.72rem] transition-all duration-300",
                              active === skill
                                ? "border-bone bg-bone text-ink"
                                : active
                                  ? "text-faint border-transparent"
                                  : "text-muted hover:border-line-strong hover:text-bone",
                            )}
                          >
                            {skill}
                            {count > 0 && (
                              <span
                                className={cn(
                                  "ml-2 tabular-nums",
                                  active === skill ? "text-ink/50" : "text-faint",
                                )}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Every skill chip is a tab stop, which is a lot of tabbing — so it
                has to be worth it. Announcing this panel politely means a
                keyboard or screen-reader user gets the same answer a mouse
                user gets on hover, rather than 38 silent buttons. */}
            <div
              id="craft-usage"
              aria-live="polite"
              className="border-line bg-ink-raised/40 sticky top-24 rounded-2xl border p-6"
            >
              <h3 className="text-faint font-mono text-[0.68rem] tracking-[0.18em] uppercase">
                {active ? `Shipped with ${active}` : "Every project"}
              </h3>
              <ul className="mt-5 space-y-1">
                {projects.map((p) => {
                  const on = !lit || lit.includes(p.slug);
                  return (
                    <li
                      key={p.slug}
                      className={cn(
                        "flex items-baseline gap-3 rounded-lg px-3 py-2 transition-all duration-300",
                        on ? "opacity-100" : "opacity-25",
                        lit?.includes(p.slug) && "bg-white/[0.04]",
                      )}
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full transition-colors"
                        style={{ backgroundColor: on ? p.accent : "#3a3f47" }}
                      />
                      <span className="text-bone flex-1 text-sm">{p.name}</span>
                      <span className="text-faint font-mono text-[0.65rem] tracking-wide">
                        {p.period.split(" – ")[0]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
