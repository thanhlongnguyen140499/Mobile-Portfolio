import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ObfuscatedEmail } from "@/components/ui/ObfuscatedEmail";
import { Reveal } from "@/components/ui/Reveal";
import { SocialLink, type SocialNetwork } from "@/components/ui/SocialLink";

/**
 * profile.links ships with bare placeholders because the CV had no profile
 * URLs on it. A half-written "in/…" on a live site reads as broken, so a
 * channel only appears once its URL actually points somewhere.
 */
function isUnset(url: string) {
  return url.trim() === "" || url.trim().endsWith("/");
}

export function Contact() {
  const channels = (
    [
      { label: "LinkedIn", network: "linkedin", href: profile.links.linkedin },
      { label: "GitHub", network: "github", href: profile.links.github },
    ] satisfies { label: string; network: SocialNetwork; href: string }[]
  ).filter((c) => !isUnset(c.href));

  return (
    <section id="contact" className="px-6 py-24 md:px-10 md:py-section">
      <div className="mx-auto max-w-[88rem]">
        <SectionLabel index="05">Contact</SectionLabel>

        <Reveal>
          <h2 className="font-display mt-12 max-w-4xl text-balance text-[clamp(2rem,6vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.03em]">
            Looking for an iOS engineer?
          </h2>

          <p className="text-muted mt-6 max-w-xl text-pretty leading-relaxed">
            I&rsquo;m open to relocating &mdash; {profile.relocation.summary}{" "}
            &mdash; and available to talk about iOS, React Native or full-stack
            product roles. The fastest way to reach me is email.
          </p>
        </Reveal>

        <div className="border-line mt-14 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
          <div className="bg-ink-raised/40 p-6">
            <div className="text-faint font-mono text-[0.65rem] tracking-[0.18em] uppercase">
              Email
            </div>
            <ObfuscatedEmail className="text-bone mt-3 block text-sm break-all" />
          </div>

          <div className="bg-ink-raised/40 p-6">
            <div className="text-faint font-mono text-[0.65rem] tracking-[0.18em] uppercase">
              Phone
            </div>
            <a
              href={`tel:${profile.phone.dial}`}
              className="text-bone hover:text-accent mt-3 block text-sm transition-colors"
            >
              {profile.phone.display}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={profile.links.cv}
            className="bg-bone text-ink rounded-full px-6 py-3 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
          >
            Download CV
          </a>
          <span className="text-faint font-mono text-[0.7rem]">
            PDF · 2 pages
          </span>
          {channels.length > 0 && (
            <span
              className="bg-line mx-2 hidden h-6 w-px sm:block"
              aria-hidden
            />
          )}
          {channels.map((c) => (
            <SocialLink
              key={c.label}
              href={c.href}
              network={c.network}
              label={c.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
