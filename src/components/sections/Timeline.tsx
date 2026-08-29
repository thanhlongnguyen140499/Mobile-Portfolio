import Link from "next/link";
import { experience } from "@/data/experience";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TechChip } from "@/components/ui/TechChip";
import { Reveal } from "@/components/ui/Reveal";

export function Timeline() {
  return (
    <section id="experience" className="px-6 py-24 md:px-10 md:py-section">
      <div className="mx-auto max-w-[88rem]">
        <SectionLabel index="03">Experience</SectionLabel>

        <ol className="mt-12 md:mt-16">
          {experience.map((role) => (
            <Reveal
              as="li"
              key={`${role.title}-${role.start}`}
              className="border-line grid gap-6 border-t py-10 md:grid-cols-12 md:gap-10 md:py-12"
            >
              <div className="md:col-span-3">
                <time
                  dateTime={role.start}
                  className="text-faint font-mono text-[0.72rem] tracking-[0.14em] uppercase"
                >
                  {role.period}
                </time>
                {role.end === null && (
                  <span className="ml-3 inline-flex items-center gap-1.5 align-middle">
                    <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" aria-hidden />
                    <span className="text-accent font-mono text-[0.65rem] tracking-[0.14em] uppercase">
                      Now
                    </span>
                  </span>
                )}
              </div>

              <div className="md:col-span-9">
                <h3 className="font-display text-bone text-xl font-medium tracking-tight md:text-2xl">
                  {role.title}
                </h3>
                <p className="text-muted mt-1.5 text-sm text-pretty">{role.subject}</p>

                <ul className="mt-5 space-y-2.5">
                  {role.bullets.map((b) => (
                    <li key={b} className="text-muted flex gap-3 text-sm leading-relaxed">
                      <span aria-hidden className="text-faint mt-[0.45em] shrink-0 text-[0.5rem]">
                        ●
                      </span>
                      <span className="text-pretty">{b}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {role.tech.map((t) => (
                    <li key={t}>
                      <TechChip>{t}</TechChip>
                    </li>
                  ))}
                </ul>

                {role.projectSlug && (
                  <Link
                    href={`/work/${role.projectSlug}`}
                    className="group text-bone mt-6 inline-flex items-center gap-2 text-sm"
                  >
                    <span className="border-line group-hover:border-bone border-b pb-0.5 transition-colors">
                      Case study
                    </span>
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
