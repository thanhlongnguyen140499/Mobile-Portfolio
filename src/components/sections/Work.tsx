import Link from "next/link";
import { featuredProjects, otherProjects, type Project } from "@/data/projects";
import { readScreens } from "@/lib/screens";
import type { AppMeta } from "@/lib/store-meta";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { TechChip } from "@/components/ui/TechChip";
import { DeviceSlot } from "@/components/DeviceSlot";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * A star average is only worth showing next to enough ratings to mean
 * something — "5.0★" off three reviews reads as padding, not as a result.
 */
const MIN_RATINGS_TO_SHOW = 25;

function storeMetaLabel(meta: AppMeta | null) {
  if (!meta) return undefined;
  const parts = [`v${meta.version}`];
  if (meta.averageUserRating && meta.userRatingCount >= MIN_RATINGS_TO_SHOW) {
    parts.push(`${meta.averageUserRating.toFixed(1)}★`);
  }
  return parts.join("  ·  ");
}

async function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const screens = await readScreens(project.slug);
  const meta = screens.meta;
  const flip = index % 2 === 1;

  return (
    <article className="border-line grid grid-cols-1 items-center gap-10 border-t py-16 md:grid-cols-12 md:gap-16 md:py-24">
      {/* The 3D gallery positions its device over this exact box, so the WebGL
          and no-WebGL layouts are pixel-identical. */}
      <div className={cn("md:col-span-5", flip ? "md:order-2 md:col-start-8" : "md:order-1")}>
        <DeviceSlot
          slug={project.slug}
          index={index}
          screens={screens.paths}
          aspect={screens.aspect}
          accent={project.accent}
          name={project.name}
          deviceScreens={screens.usableAsTexture}
          priority={index === 0}
        />
      </div>

      <Reveal className={cn("md:col-span-6", flip ? "md:order-1 md:col-start-1" : "md:order-2")}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.7rem] tracking-[0.2em]" style={{ color: project.accent }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-faint font-mono text-[0.7rem] tracking-[0.16em] uppercase">
            {project.period}
          </span>
        </div>

        <h3 className="font-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.02] font-semibold tracking-[-0.025em]">
          {project.name}
        </h3>

        <p className="text-muted mt-4 max-w-xl text-pretty text-[1.02rem] leading-relaxed">
          {project.tagline}
        </p>

        <p className="text-faint mt-3 font-mono text-[0.72rem] tracking-wide">{project.context}</p>

        {project.metrics.length > 0 && (
          <dl className="border-line mt-8 grid grid-cols-3 gap-4 border-t pt-6">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="font-display text-bone block text-xl font-medium tracking-tight md:text-2xl">
                    {m.value}
                  </span>
                  <span className="text-faint mt-1 block max-w-[18ch] font-mono text-[0.65rem] leading-snug tracking-[0.1em] uppercase">
                    {m.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/work/${project.slug}`}
            className="group text-bone inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="border-line group-hover:border-bone border-b pb-1 transition-colors">
              Read the case study
            </span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          {project.links.appStore && (
            <StoreBadge href={project.links.appStore} store="apple" meta={storeMetaLabel(meta)} />
          )}
          {project.links.playStore && <StoreBadge href={project.links.playStore} store="play" />}
        </div>

        <ul className="mt-8 flex flex-wrap gap-2">
          {project.tech.slice(0, 8).map((t) => (
            <li key={t}>
              <TechChip>{t}</TechChip>
            </li>
          ))}
          {project.tech.length > 8 && (
            <li>
              <TechChip dim>+{project.tech.length - 8} more</TechChip>
            </li>
          )}
        </ul>
      </Reveal>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group border-line hover:border-line-strong hover:bg-ink-raised relative flex flex-col rounded-2xl border p-6 transition-colors"
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: project.accent }}
      />
      <h4 className="font-display text-bone mt-5 text-lg font-medium tracking-tight">
        {project.name}
      </h4>
      <p className="text-muted mt-2 flex-1 text-sm leading-relaxed text-pretty">
        {project.tagline}
      </p>
      <div className="text-faint mt-6 flex items-center justify-between font-mono text-[0.68rem] tracking-[0.12em] uppercase">
        <span>{project.period}</span>
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

export function Work() {
  return (
    <section id="work" className="px-6 py-24 md:px-10 md:py-section">
      <div className="mx-auto max-w-[88rem]">
        <SectionLabel index="01">Selected work</SectionLabel>

        <Reveal>
          <p className="text-muted mt-8 max-w-2xl text-pretty text-[clamp(1.1rem,2.2vw,1.6rem)] leading-snug">
            Three products I own the most surface area on — one shipped for a company, one for a
            client, one built end to end on my own.
          </p>
        </Reveal>

        <div className="mt-12 md:mt-16">
          {featuredProjects.map((p, i) => (
            <FeaturedProject key={p.slug} project={p} index={i} />
          ))}
        </div>

        <div className="border-line mt-20 border-t pt-12">
          <h3 className="text-faint font-mono text-[0.7rem] tracking-[0.22em] uppercase">
            Also shipped
          </h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherProjects.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
