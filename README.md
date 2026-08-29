# Portfolio — Nguyen Thanh Long

An iOS/mobile engineering portfolio with a scroll-driven 3D device gallery: real App
Store screenshots mapped onto phones built in three.js, docked to the page's own
layout boxes.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # everything prerenders to static HTML
```

---

## Before it goes live

Three things need your input. Everything else runs.

1. **Your profile URLs** — `src/data/profile.ts` → `links.linkedin` and `links.github`.
   They ship as bare placeholders, and the Contact section deliberately *hides* a
   channel whose URL still ends in `/` rather than showing a broken `in/…`. Fill them
   in and the cells appear.

2. **The site origin** — copy `.env.example` to `.env.local` (and set the same
   variable in your host's dashboard):

   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

   Until then `sitemap.xml`, `robots.txt` and canonical links all say `localhost:3000`.

3. **Caloer's Google Play URL** — `src/data/projects.ts`. Your CV cites 100K+ installs
   there and the metric is on the page, but the badge can't link to it. I couldn't find
   the package id by guessing, and I won't ship a URL I haven't opened.

Optional: `public/cv.pdf` is generated from the Word file by `pnpm cv`, which keeps the
text and headings but substitutes fonts. Exporting to PDF from Word and overwriting
`public/cv.pdf` gives a better-looking file.

---

## Adding another app

Two steps.

**1.** Add an object to `projects` in `src/data/projects.ts`. Copy the `wispr-network`
entry and change the content. The fields that matter:

```ts
{
  slug: "your-app",
  featured: true,            // featured projects get a 3D device
  realScreens: true,         // false → draws a placeholder UI instead
  screenCount: 5,            // how many screenshots to pull
  accent: "#3ba9d4",         // bleeds into the scene lighting
  links: { appStore: "...", appleId: "6479228847" },
  // ...
}
```

**2.** Run `pnpm assets`.

That hits Apple's lookup API and writes `public/apps/<slug>/` — icon, screenshots and a
`meta.json` snapshot of the live version, rating and release date that the page renders
without any runtime request. It also **strips the marketing frame**: App Store
screenshots are usually a real capture drawn inside a fake phone bezel on a gradient,
and mapping that onto a 3D phone would put a phone inside a phone, so the script
detects the bezel and crops back to the bare screen.

Google Play has no equivalent public API. For a Play-only app, set `realScreens: true`
and drop `screen-1.webp`…`screen-N.webp` into `public/apps/<slug>/` by hand — 9:16,
around 720×1280.

More than three featured projects will need new entries in `HERO_POSES`
(`src/components/scene/Device.tsx`); the cluster is hand-composed for three.

---

## How the 3D works

**The layout is CSS. The 3D just follows it.**

The camera is positioned so one world unit equals one CSS pixel at `z=0`
(`PixelPerfectCamera` in `src/components/scene/Scene.tsx`). Each `DeviceSlot` in the
DOM registers itself in a small registry, and every frame the matching 3D device reads
that element's `getBoundingClientRect()` and puts itself exactly there. Nothing about
device placement is hardcoded — change the layout in Tailwind and the devices follow.

That's also why the fallback is trustworthy: the same slot renders a CSS device frame
around the same screenshot, so the WebGL and no-WebGL versions of the page agree by
construction rather than by tuning.

In the hero the devices blend out of a hand-composed cluster (anchored to an empty
`<HeroAnchor />` box, so even that is positioned by CSS) into their slots over the
first ~60% of a viewport height of scroll. The anchor registers itself in the same slot
registry as the devices rather than being found with `querySelector` — the canvas lives
in the root layout and outlives the page, so a cached node goes stale on the first
navigation and then measures as all zeros.

Docked, a device does **not** sit square to the camera — square-on it is
indistinguishable from a flat image and the WebGL is wasted. It settles into a
three-quarter turn that catches the lightformers down one edge, mirrored to match which
column `Work` puts it in, and scroll turns it further as it crosses the viewport.
Hovering squares it back up to face you. The CSS fallback carries the same angle as a
`perspective()` transform, applied to a child of the measured element so it can't move
the box the gallery aligns to.

**Three ways it steps down**, in `src/lib/tier.ts`:

| Condition | Result |
|---|---|
| No WebGL | Canvas never mounts. CSS device frames stay. |
| `prefers-reduced-motion` | Devices dock to their slots and hold still — no float, parallax, hero cluster or screenshot cycling. |
| Coarse pointer / low core count | DPR capped, postprocessing off. `<PerformanceMonitor>` steps down again if frames still drop. |

The canvas is mounted in the **root layout**, not the page, so the WebGL context and
uploaded textures survive navigating into a case study and back. On routes with no
device slots it parks its render loop and clears the buffer.

three.js is loaded through `next/dynamic` with `ssr: false` — it sits in a lazy ~1.1MB
chunk that the initial HTML never references.

### Notable pieces

| File | What's interesting |
|---|---|
| `src/lib/geometry.ts` | The phone body is an extruded rounded-rect with a bevelled edge. drei's `<RoundedBox>` clamps its radius to half the smallest dimension, which on something as thin as a phone collapses the face corners and lets the screen poke out. |
| `src/lib/screen-material.ts` | Screens are unlit and untonemapped, so a screenshot reads at true brightness like a display rather than lit paper. Cross-fades between screenshots on the GPU. |
| `src/components/scene/Lighting.tsx` | A studio of five `<Lightformer>`s baked to a 256px cubemap — no HDRI download, and the reflections are art-directed instead of photographed. |
| `src/lib/mock-screen.ts` | Projects without device-safe screenshots draw a placeholder UI to a canvas. The same routine feeds both the DOM fallback and the three.js texture, so they can't drift. |
| `src/lib/screens.ts` | Single place that turns a `meta.json` into "can this be a device texture?" — every component reads that rather than carrying its own flag. |
| `scripts/fetch-store-assets.mjs` | Store art pipeline, including the bezel detection. |

---

## Content

Everything the site renders comes from `src/data/`, typed:

- `profile.ts` — name, contact, education, certifications, languages
- `projects.ts` — case studies, metrics, stacks, store links
- `experience.ts` — the timeline
- `skills.ts` — grouped as the CV groups them, plus the aliasing that matches a skill
  chip to project stacks (`Node.js` on a skill vs `NodeJS` on a project)

**Three content notes.**

- **The Philadelphia Inquirer is client work**, named here because you supplied the
  public store link. The copy is scoped to your contribution — SwiftUI feature modules
  bridged into an app that has shipped since 2012 — and never implies you built the
  app. Worth confirming your client is comfortable being named before this goes live.
- The Wispr screenshots are public App Store marketing assets, but they're your
  employer's product — worth a word with whoever owns that.
- Caloer's App Store listing names **Nguyen Hai Anh** as the seller. The site describes
  it as a personal product you built and maintain, per your CV. A recruiter who opens
  the listing sees a different developer name, so a line explaining a shared account
  may be worth adding.

---

## Deploy

Static output, so anything works. Vercel:

```bash
gh repo create portfolio --private --source=. --push
npx vercel
```

Set `NEXT_PUBLIC_SITE_URL` in the project's environment variables.
# Mobile-Portfolio
