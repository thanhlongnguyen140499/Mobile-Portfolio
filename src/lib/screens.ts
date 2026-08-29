import "server-only";
import { MOCK_SIZE } from "@/lib/mock-screen";
import { readAppMeta, type AppMeta } from "@/lib/store-meta";

export type ScreenSet = {
  /** Files on disk under /apps/<slug>/. Empty when nothing has been fetched. */
  paths: string[];
  /**
   * How the art can be used. Derived from the asset script's classification,
   * never hand-maintained:
   *   capture   — bare screens; safe to map onto the 3D device
   *   marketing — designed panels; fine in a gallery, but putting one on a 3D
   *               phone would draw a phone inside a phone
   *   null      — nothing fetched (client work, or not published yet)
   */
  kind: "capture" | "marketing" | null;
  /** Aspect the 3D device should be built at. */
  aspect: number;
  /** Whether the 3D gallery can texture a device with these. */
  usableAsTexture: boolean;
  meta: AppMeta | null;
};

const MOCK_ASPECT = MOCK_SIZE.width / MOCK_SIZE.height;

export async function readScreens(slug: string): Promise<ScreenSet> {
  const meta = await readAppMeta(slug);
  const paths = meta
    ? Array.from({ length: meta.screens }, (_, i) => `/apps/${slug}/screen-${i + 1}.webp`)
    : [];
  const kind = meta?.screenKind ?? null;
  const usableAsTexture = kind === "capture" && paths.length > 0;

  return {
    paths,
    kind,
    aspect: usableAsTexture ? (meta?.screenAspect ?? MOCK_ASPECT) : MOCK_ASPECT,
    usableAsTexture,
    meta,
  };
}
