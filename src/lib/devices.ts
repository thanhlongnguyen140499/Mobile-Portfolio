import "server-only";
import { featuredProjects } from "@/data/projects";
import { readScreens } from "@/lib/screens";
import type { DeviceSpec } from "@/components/scene/Scene";

/**
 * Resolved on the server so the client never waits on a store lookup, and so
 * each device's aspect comes from the app's real screen rather than a guess.
 *
 * A project only gets real screenshots on its 3D device if the asset pipeline
 * classified them as bare captures; marketing art falls back to a drawn
 * placeholder rather than putting a phone illustration on a 3D phone.
 */
export async function getDeviceSpecs(): Promise<DeviceSpec[]> {
  return Promise.all(
    featuredProjects.map(async (p) => {
      const screens = await readScreens(p.slug);
      return {
        slug: p.slug,
        accent: p.accent,
        aspect: screens.aspect,
        screens: screens.usableAsTexture ? screens.paths : [],
        deviceScreens: screens.usableAsTexture,
      };
    }),
  );
}
