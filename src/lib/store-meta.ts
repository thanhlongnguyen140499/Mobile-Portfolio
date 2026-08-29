import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type AppMeta = {
  slug: string;
  trackName: string;
  sellerName: string;
  genre: string;
  version: string;
  minimumOsVersion: string;
  releaseDate: string;
  currentVersionReleaseDate: string;
  averageUserRating: number | null;
  userRatingCount: number;
  screens: number;
  screenAspect: number | null;
  /** "capture" = safe as a 3D device texture. "marketing" = gallery only. */
  screenKind: "capture" | "marketing" | null;
  storefront: string;
  fetchedAt: string;
};

/**
 * Reads the snapshot written by `pnpm assets` at build time, so the page can
 * show the live store version and rating with no runtime request. Returns null
 * for projects that have no listing (client work, unreleased, Play-only).
 */
export async function readAppMeta(slug: string): Promise<AppMeta | null> {
  try {
    const file = path.join(process.cwd(), "public", "apps", slug, "meta.json");
    return JSON.parse(await readFile(file, "utf8")) as AppMeta;
  } catch {
    return null;
  }
}
