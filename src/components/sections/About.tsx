import Image from "next/image";
import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-section">
      <div className="mx-auto max-w-[88rem]">
        <SectionLabel index="04">About</SectionLabel>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <Image
                src={profile.avatar.src}
                width={profile.avatar.width}
                height={profile.avatar.height}
                alt={`${profile.name}, ${profile.role}`}
                sizes="(min-width: 640px) 13rem, 60vw"
                className="border-line w-40 shrink-0 rounded-2xl border object-cover sm:w-52"
              />
              <p className="text-bone text-pretty text-[clamp(1.15rem,2.4vw,1.7rem)] leading-[1.45]">
                {profile.summary}
              </p>
            </div>

            <div className="border-line mt-10 rounded-2xl border p-6">
              <h3 className="text-faint font-mono text-[0.68rem] tracking-[0.18em] uppercase">
                Relocation
              </h3>
              <p className="text-muted mt-3 text-pretty text-sm leading-relaxed">
                Based in {profile.location}, and open to relocating internationally &mdash;{" "}
                <span className="text-bone">{profile.relocation.targets.join(", ")}</span> and
                elsewhere. Eligible for a Singapore Employment Pass, with full professional
                English.
              </p>
            </div>
          </div>

          <div className="space-y-10 lg:col-span-5">
            <div>
              <h3 className="text-faint font-mono text-[0.68rem] tracking-[0.18em] uppercase">
                Education
              </h3>
              <ul className="mt-5 space-y-5">
                {profile.education.map((e) => (
                  <li key={e.school} className="border-line border-t pt-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-bone text-sm font-medium">{e.school}</span>
                      <span className="text-faint shrink-0 font-mono text-[0.68rem]">{e.date}</span>
                    </div>
                    <p className="text-muted mt-1 text-sm">{e.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-faint font-mono text-[0.68rem] tracking-[0.18em] uppercase">
                Certifications
              </h3>
              <ul className="mt-5 space-y-5">
                {profile.certifications.map((c) => (
                  <li key={c.name} className="border-line border-t pt-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-bone text-sm font-medium text-pretty">{c.name}</span>
                      <span className="text-faint shrink-0 font-mono text-[0.68rem]">{c.date}</span>
                    </div>
                    {"issuer" in c && c.issuer && (
                      <p className="text-muted mt-1 text-sm">{c.issuer}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-faint font-mono text-[0.68rem] tracking-[0.18em] uppercase">
                Languages
              </h3>
              <ul className="mt-5 space-y-3">
                {profile.languages.map((l) => (
                  <li key={l.name} className="flex items-baseline justify-between gap-4">
                    <span className="text-bone text-sm">{l.name}</span>
                    <span className="text-muted text-right font-mono text-[0.68rem]">
                      {l.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
