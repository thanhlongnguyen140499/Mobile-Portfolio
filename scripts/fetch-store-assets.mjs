/**
 * Pulls real store art for every project that has an Apple app id.
 *
 * Apple's public lookup endpoint gives us the icon, every screenshot, the live
 * version string and the rating — so the site can show real product art and
 * real store facts without a runtime API call or any scraping.
 *
 * Two details make the output usable as a 3D texture:
 *
 *   1. Screenshot thumb URLs carry their resolution in the last path segment,
 *      so swapping `/392x696bb.png` for `/1242x2688bb.png` gets the full-res
 *      asset.
 *   2. App Store screenshots are usually *marketing frames* — the real capture
 *      sits inside a drawn phone bezel on a gradient, often with caption text.
 *      Mapping that onto a 3D phone would put a phone inside a phone, so we
 *      detect the bezel and crop back to the bare screen. Screenshots that are
 *      already raw captures pass through untouched.
 *
 * Re-runnable. Adding a new app = one object in src/data/projects.ts with an
 * `appleId`, then `pnpm assets`.
 *
 *   node --experimental-strip-types scripts/fetch-store-assets.mjs [slug ...]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { projects } from "../src/data/projects.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "apps");

/** Ask Apple for the largest render it publishes for each device class. */
const SOURCE_RES = { iphone: "1242x2688bb.png", ipad: "1536x2048bb.png" };
/** Texture width. Height follows the app's real screen aspect. */
const TEXTURE_WIDTH = 720;

const only = process.argv.slice(2);
const log = (...a) => console.log("  ", ...a);

async function lookup(appleId, storefront) {
  // Ratings are per-storefront, and it matters: Caloer reads 4.7 from ~4,900
  // ratings on the Vietnamese store and 4.4 from 71 on the US one. Each project
  // names the storefront its audience actually uses.
  const country = storefront ?? "us";
  const res = await fetch(`https://itunes.apple.com/lookup?id=${appleId}&country=${country}`);
  if (!res.ok) throw new Error(`lookup ${appleId} → HTTP ${res.status}`);
  const { results } = await res.json();
  if (!results?.length) throw new Error(`lookup ${appleId} → no results`);
  return results[0];
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Rewrites a thumb URL's trailing size segment to ask for a bigger render. */
function atResolution(url, size) {
  return url.replace(/\/[0-9]+x[0-9]+bb\.(png|jpg)$/i, `/${size}`);
}

/**
 * Finds the bare screen inside a drawn phone bezel.
 *
 * The bezel is the one thing in a marketing frame that is near-black and spans
 * most of a row (top/bottom bezel) or most of the device's height (side
 * bezels), so scanning for those bands brackets the screen from four sides.
 * Returns null when there's no bezel to strip — the screenshot is already raw.
 */
async function detectScreenRect(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { channels: C, width: W, height: H } = info;

  const isDark = (x, y) => {
    const i = (y * W + x) * C;
    return data[i] < 45 && data[i + 1] < 45 && data[i + 2] < 45;
  };

  // Contiguous runs where the dark fraction clears the threshold.
  const bands = (fractions, threshold) => {
    const out = [];
    let start = -1;
    for (let i = 0; i < fractions.length; i++) {
      if (fractions[i] > threshold) {
        if (start < 0) start = i;
      } else if (start >= 0) {
        out.push([start, i - 1]);
        start = -1;
      }
    }
    if (start >= 0) out.push([start, fractions.length - 1]);
    return out.filter(([a, z]) => z - a > 3); // ignore 1–2px noise
  };

  const rowFrac = [];
  for (let y = 0; y < H; y++) {
    let c = 0;
    for (let x = 0; x < W; x++) if (isDark(x, y)) c++;
    rowFrac.push(c / W);
  }
  const rowBands = bands(rowFrac, 0.5);
  if (rowBands.length < 2) return null;

  const deviceTop = rowBands[0][0];
  const deviceBottom = rowBands.at(-1)[1];
  const top = rowBands[0][1] + 1;
  const bottom = rowBands.at(-1)[0] - 1;

  // Side bezels only read as dark within the device's own vertical span.
  const span = deviceBottom - deviceTop + 1;
  const colFrac = [];
  for (let x = 0; x < W; x++) {
    let c = 0;
    for (let y = deviceTop; y <= deviceBottom; y++) if (isDark(x, y)) c++;
    colFrac.push(c / span);
  }
  const colBands = bands(colFrac, 0.5);
  if (colBands.length < 2) return null;

  const left = colBands[0][1] + 1;
  const right = colBands.at(-1)[0] - 1;
  const width = right - left + 1;
  const height = bottom - top + 1;
  if (width < 100 || height < 100) return null;

  // Sanity-check the result really is a phone screen before trusting it.
  const aspect = width / height;
  const coverage = (width * height) / (W * H);
  if (aspect < 0.35 || aspect > 0.95 || coverage < 0.15) return null;

  return { left, top, width, height };
}

/**
 * Finds the phone on a marketing panel whose background is a flat colour.
 *
 * This is the dominant modern template — a device mockup and a caption over a
 * solid brand colour — and the bezel detector above can't see it, because the
 * bezel is thin and light rather than a fat black band. Subtracting the
 * background instead makes the device the only large object in the frame.
 *
 * Rows that are mostly not-background are device rows; the caption is only a
 * few short bands, so taking the *longest contiguous* run picks the phone.
 */
async function detectByBackground(buffer) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const { channels: C, width: W, height: H } = info;
  const at = (x, y) => {
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // Median of the four corners, so one stray decoration can't define the bg.
  const corners = [at(2, 2), at(W - 3, 2), at(2, H - 3), at(W - 3, H - 3)];
  const bg = [0, 1, 2].map((k) => corners.map((c) => c[k]).sort((a, b) => a - b)[1]);

  // If the corners disagree the background isn't flat — a gradient or a
  // pattern — and this method's assumption is already broken.
  const spread = Math.max(
    ...corners.map((c) => Math.max(...c.map((v, k) => Math.abs(v - bg[k])))),
  );
  if (spread > 12) return null;

  const off = (x, y) => {
    const p = at(x, y);
    return Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) > 60;
  };

  const longestRun = (values, threshold) => {
    let best = [0, -1];
    let start = -1;
    for (let i = 0; i <= values.length; i++) {
      const hit = i < values.length && values[i] > threshold;
      if (hit) {
        if (start < 0) start = i;
      } else if (start >= 0) {
        if (i - start > best[1] - best[0]) best = [start, i - 1];
        start = -1;
      }
    }
    return best;
  };

  const rows = [];
  for (let y = 0; y < H; y++) {
    let c = 0;
    for (let x = 0; x < W; x += 2) if (off(x, y)) c++;
    rows.push(c / (W / 2));
  }
  const [top, bottom] = longestRun(rows, 0.34);
  if (bottom <= top) return null;

  const cols = [];
  for (let x = 0; x < W; x++) {
    let c = 0;
    for (let y = top; y <= bottom; y += 2) if (off(x, y)) c++;
    cols.push(c / ((bottom - top) / 2));
  }
  const [left, right] = longestRun(cols, 0.5);
  if (right <= left) return null;

  // Trim past the device's rounded corners, which still hold background colour.
  const width = right - left + 1;
  const height = bottom - top + 1;
  const inset = Math.round(width * 0.012);
  const rect = {
    left: left + inset,
    top: top + inset,
    width: width - inset * 2,
    height: height - inset * 2,
  };

  const aspect = rect.width / rect.height;
  const coverage = (rect.width * rect.height) / (W * H);
  // A tilted or multi-device mockup gives a bounding box far too wide to be a
  // screen; rejecting on aspect is what keeps those out.
  if (aspect < 0.4 || aspect > 0.85 || coverage < 0.15) return null;

  return rect;
}

async function processApp(project) {
  const { slug, links, deviceKind, screenCount } = project;
  console.log(`\n▸ ${project.name} (${links.appleId})`);

  const app = await lookup(links.appleId, links.storefront);
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });

  // --- icon -------------------------------------------------------------
  if (app.artworkUrl512) {
    await sharp(await download(app.artworkUrl512))
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 90 })
      .toFile(path.join(dir, "icon.webp"));
    log("icon.webp");
  }

  // --- screenshots ------------------------------------------------------
  const source =
    deviceKind === "ipad"
      ? (app.ipadScreenshotUrls ?? app.screenshotUrls ?? [])
      : (app.screenshotUrls ?? app.ipadScreenshotUrls ?? []);

  /* `screenIndices` picks specific shots out of a listing — some templates mix
     usable upright mockups with tilted or multi-device ones. */
  const picked = project.screenIndices
    ? project.screenIndices.map((i) => source[i]).filter(Boolean)
    : source;
  const wanted = picked.slice(0, screenCount || picked.length);
  if (!wanted.length) log("! no screenshots on the listing");

  let written = 0;
  let unframed = 0;
  let detectedAny = false;
  /** Locked from the first screenshot so every texture comes out identical. */
  let target = null;

  for (const [i, url] of wanted.entries()) {
    const raw = await download(atResolution(url, SOURCE_RES[deviceKind] ?? SOURCE_RES.iphone));
    /* Manual crop wins: some templates defeat both detectors, and a rect
       measured once by eye beats a heuristic that is right most of the time. */
    let rect = null;
    if (project.screenCrop) {
      const meta = await sharp(raw).metadata();
      const c = project.screenCrop;
      rect = {
        left: Math.round(c.x * meta.width),
        top: Math.round(c.y * meta.height),
        width: Math.round(c.w * meta.width),
        height: Math.round(c.h * meta.height),
      };
    } else {
      rect = (await detectScreenRect(raw)) ?? (await detectByBackground(raw));
    }
    if (rect) {
      unframed++;
      detectedAny = true;
    }

    let pipeline = sharp(raw);
    if (rect) pipeline = pipeline.extract(rect);

    if (!target) {
      const meta = rect ?? (await sharp(raw).metadata());
      const aspect = meta.width / meta.height;
      // Even numbers keep GPU mipmap generation happy.
      const h = Math.round(TEXTURE_WIDTH / aspect / 2) * 2;
      target = { width: TEXTURE_WIDTH, height: h, aspect: TEXTURE_WIDTH / h };
    }

    await pipeline
      .resize(target.width, target.height, { fit: "cover", position: "centre" })
      .webp({ quality: 82 })
      .toFile(path.join(dir, `screen-${i + 1}.webp`));
    written++;
  }

  /*
   * Two kinds of art end up on a store listing, and only one can be a texture.
   *
   *   capture   — a bare screen (or a marketing frame we successfully stripped
   *               back to one). Safe to map onto the 3D device.
   *   marketing — a designed panel: the app drawn inside a phone illustration,
   *               often tilted, on a background, with caption text. Mapping
   *               that onto a 3D phone puts a phone inside a phone.
   *
   * Only a listing where a bezel was found and stripped from *every* shot is
   * called a capture. Everything else is assumed to be marketing art.
   *
   * That's deliberately pessimistic: a listing of genuinely bare captures gets
   * misfiled as marketing and falls back to a drawn placeholder, which looks
   * fine, whereas the opposite mistake puts a tilted phone illustration onto a
   * 3D phone. Set `screenStyle: "capture"` on the project to override.
   *
   * (Measured alternatives — edge-column variance, aspect matching — separated
   * this repo's two real listings by too small a margin to trust: 4.6 for known
   * marketing art against 7.7 for a known bare capture.)
   */
  const detected = written > 0 && detectedAny && unframed === written;
  const screenKind = project.screenStyle ?? (written === 0 ? null : detected ? "capture" : "marketing");

  if (written) {
    log(`${written} screenshot(s) → ${target.width}×${target.height}.webp`);
    if (screenKind === "capture") {
      log(unframed && detectedAny ? `unframed ${unframed}/${written} — bare screens` : "already bare screens");
    } else {
      log(`classified as marketing art (${unframed}/${written} unframed) — gallery only, not a device texture`);
    }
  }

  // --- meta -------------------------------------------------------------
  const meta = {
    slug,
    trackName: app.trackName,
    sellerName: app.sellerName,
    genre: app.primaryGenreName,
    version: app.version,
    minimumOsVersion: app.minimumOsVersion,
    releaseDate: app.releaseDate,
    currentVersionReleaseDate: app.currentVersionReleaseDate,
    averageUserRating: app.averageUserRating ?? null,
    userRatingCount: app.userRatingCount ?? 0,
    screens: written,
    /** The 3D device builds its geometry from this, so it matches the real app. */
    screenAspect: target ? Number(target.aspect.toFixed(4)) : null,
    /** "capture" = safe as a device texture. "marketing" = gallery only. */
    screenKind,
    storefront: links.storefront ?? "us",
    fetchedAt: new Date().toISOString(),
  };
  await writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  log(`meta.json — v${meta.version}, ${meta.averageUserRating ?? "–"}★`);
}

const targets = projects.filter(
  (p) => p.links.appleId && (!only.length || only.includes(p.slug)),
);

if (!targets.length) {
  console.error("No projects with an `appleId` matched. Nothing to do.");
  process.exit(1);
}

let failed = 0;
for (const project of targets) {
  try {
    await processApp(project);
  } catch (err) {
    failed++;
    console.error(`\n✗ ${project.slug}: ${err.message}`);
  }
}

// Projects that need art but can't be fetched — Play-only apps, or client work
// with no public listing — are called out so they don't silently ship blank.
const manual = projects.filter((p) => p.realScreens && !p.links.appleId);
if (manual.length) {
  console.log(
    `\nManual assets still needed (no Apple listing): ${manual.map((p) => p.slug).join(", ")}`,
  );
  console.log("  Drop screen-1..N.webp into public/apps/<slug>/ by hand.");
}

console.log(failed ? `\nDone with ${failed} failure(s).` : "\nDone.");
process.exit(failed ? 1 : 0);
