import { profile } from "@/data/profile";
import { HeroAnchor } from "@/components/HeroAnchor";

const STATS = [
  { v: `${profile.yearsExperience} yrs`, l: "Shipping production apps" },
  { v: "130K+", l: "Downloads across two stores" },
  { v: "SwiftUI", l: "Primary client stack today" },
  { v: "Full-stack", l: "Node · Spring Boot · GraphQL" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end px-6 pt-32 pb-16 md:px-10 md:pb-24"
    >
      <HeroAnchor />

      <div className="mx-auto w-full max-w-[88rem]">
        {/* Text is held to the left of the device cluster rather than centred
            under it — the two share the viewport, so neither can run wide. */}
        <div className="md:max-w-[58%]">
          <p className="text-faint mb-8 font-mono text-[0.7rem] tracking-[0.22em] uppercase">
            {profile.location}
            <span className="text-line-strong mx-3">/</span>
            {profile.relocation.note}
          </p>

          <h1 className="font-display text-balance text-[clamp(2.5rem,6.2vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
            {profile.name}
          </h1>

          <p className="text-muted mt-8 max-w-xl text-pretty text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed">
            {profile.intro}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="bg-bone text-ink rounded-full px-6 py-3 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
            >
              See the work
            </a>
            <a
              href={profile.links.cv}
              className="border-line hover:border-line-strong hover:bg-ink-raised rounded-full border px-6 py-3 text-sm font-medium transition-colors"
            >
              Download CV
            </a>
          </div>
        </div>

        <div className="border-line mt-14 grid grid-cols-2 gap-y-6 border-t pt-8 md:mt-16 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l}>
              <div className="font-display text-bone text-2xl font-medium tracking-tight md:text-3xl">
                {s.v}
              </div>
              <div className="text-faint mt-1 max-w-[22ch] font-mono text-[0.68rem] leading-snug tracking-[0.1em] uppercase">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
