import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { TechChip } from "@/components/ui/TechChip";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { getProject, projects } from "@/data/projects";
import { readScreens } from "@/lib/screens";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.name,
      description: project.tagline,
      url: `/work/${project.slug}`,
      type: "article",
    },
  };
}

function Prose({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-faint font-mono text-[0.68rem] tracking-[0.2em] uppercase">{title}</h2>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="text-muted flex gap-4 leading-relaxed">
            <span aria-hidden className="text-faint mt-[0.55em] shrink-0 text-[0.5rem]">
              ●
            </span>
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CaseStudy(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const screens = await readScreens(project.slug);
  const meta = screens.meta;
  /* Bare captures get a device frame. Marketing panels are already designed
     artwork — framing one inside a drawn phone would nest a phone in a phone —
     so they run full width below the body instead, at a size where their own
     captions are still readable. */
  const framed = screens.kind === "capture";
  const panels = screens.kind === "marketing" ? screens.paths : [];

  const order = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(order + 1) % projects.length];

  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        <article className="px-6 pt-32 pb-24 md:px-10 md:pt-40">
          <div className="mx-auto max-w-[88rem]">
            <Link
              href="/#work"
              className="group text-muted hover:text-bone inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              All work
            </Link>

            <header className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span
                    className="font-mono text-[0.7rem] tracking-[0.18em] uppercase"
                    style={{ color: project.accent }}
                  >
                    {project.period}
                  </span>
                  <span className="text-faint font-mono text-[0.7rem] tracking-[0.16em]">
                    {project.role}
                  </span>
                </div>

                <h1 className="font-display mt-5 text-balance text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.03em]">
                  {project.name}
                </h1>

                <p className="text-muted mt-6 max-w-2xl text-pretty text-[clamp(1.05rem,1.9vw,1.35rem)] leading-relaxed">
                  {project.tagline}
                </p>

                <p className="text-faint mt-4 font-mono text-[0.72rem]">{project.context}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {project.links.appStore && (
                    <StoreBadge
                      href={project.links.appStore}
                      store="apple"
                      meta={meta ? `v${meta.version}` : undefined}
                    />
                  )}
                  {project.links.playStore && (
                    <StoreBadge href={project.links.playStore} store="play" />
                  )}
                  {project.links.site && (
                    <a
                      href={project.links.site}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="border-line hover:border-line-strong hover:bg-ink-raised text-bone inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium transition-colors"
                    >
                      Website ↗
                    </a>
                  )}
                </div>
              </div>

              {project.metrics.length > 0 && (
                <dl className="border-line grid grid-cols-3 content-start gap-4 border-t pt-6 lg:col-span-4 lg:grid-cols-1 lg:gap-8 lg:border-t-0 lg:border-l lg:pt-2 lg:pl-10">
                  {project.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="sr-only">{m.label}</dt>
                      <dd>
                        <span className="font-display text-bone block text-2xl font-medium tracking-tight">
                          {m.value}
                        </span>
                        <span className="text-faint mt-1 block font-mono text-[0.65rem] leading-snug tracking-[0.1em] uppercase">
                          {m.label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </header>

            <div className="border-line mt-16 grid gap-12 border-t pt-14 lg:grid-cols-12 lg:gap-16">
              <div className="space-y-12 lg:col-span-7">
                <div>
                  <h2 className="text-faint font-mono text-[0.68rem] tracking-[0.2em] uppercase">
                    The problem
                  </h2>
                  <p className="text-bone mt-5 text-pretty text-[1.1rem] leading-relaxed">
                    {project.problem}
                  </p>
                </div>
                <Prose title="What I built" items={project.approach} />
                <Prose title="Outcome" items={project.impact} />

                <div>
                  <h2 className="text-faint font-mono text-[0.68rem] tracking-[0.2em] uppercase">
                    Stack
                  </h2>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <li key={t}>
                        <TechChip>{t}</TechChip>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-5">
                {framed ? (
                  <div className="sticky top-24">
                    <div className="grid grid-cols-2 gap-5">
                      {screens.paths.map((src, i) => (
                        <DeviceFrame key={src} aspect={screens.aspect} accent={project.accent}>
                          <Image
                            src={src}
                            alt={`${project.name} — screen ${i + 1}`}
                            fill
                            sizes="(max-width: 1024px) 45vw, 220px"
                            priority={i === 0}
                            className="object-cover"
                          />
                        </DeviceFrame>
                      ))}
                    </div>
                    {meta && (
                      <p className="text-faint mt-6 font-mono text-[0.65rem] leading-relaxed">
                        Screens pulled from the live App Store listing · v{meta.version} ·{" "}
                        {new Date(meta.currentVersionReleaseDate).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border-line text-muted sticky top-24 rounded-2xl border p-6 text-sm leading-relaxed text-pretty">
                    {panels.length > 0
                      ? "The App Store artwork for this app is below — designed panels rather than bare screen captures."
                      : "No screenshots published for this project — it's client work without a public listing, so the interface is described rather than shown."}
                    {meta && (
                      <p className="text-faint mt-4 font-mono text-[0.65rem] leading-relaxed">
                        Live listing · v{meta.version} ·{" "}
                        {new Date(meta.currentVersionReleaseDate).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })}
                        {meta.averageUserRating && meta.userRatingCount >= 25
                          ? ` · ${meta.averageUserRating.toFixed(1)}★ from ${meta.userRatingCount.toLocaleString("en-GB")} ratings`
                          : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {panels.length > 0 && (
              <section className="border-line mt-20 border-t pt-12" aria-label="App Store artwork">
                <h2 className="text-faint font-mono text-[0.68rem] tracking-[0.2em] uppercase">
                  From the App Store
                </h2>
                {/* Its own scroll container: the panels are portrait and text-bearing,
                    so shrinking them to fit the grid would make the captions unreadable. */}
                <div className="-mx-6 mt-6 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10">
                  <ul className="flex w-max gap-5">
                    {panels.map((src, i) => (
                      <li key={src} className="shrink-0">
                        <Image
                          src={src}
                          alt={`${project.name} — App Store artwork ${i + 1}`}
                          width={720}
                          height={1564}
                          sizes="300px"
                          priority={i === 0}
                          className="border-line h-[min(70vh,560px)] w-auto rounded-2xl border object-contain"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            <nav className="border-line mt-20 border-t pt-10" aria-label="More work">
              <SectionLabel index="→">Next</SectionLabel>
              <Link href={`/work/${next.slug}`} className="group mt-6 block">
                <span className="font-display text-bone group-hover:text-accent text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold tracking-tight transition-colors">
                  {next.name}
                </span>
                <span className="text-muted mt-2 block text-sm text-pretty">{next.tagline}</span>
              </Link>
            </nav>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
