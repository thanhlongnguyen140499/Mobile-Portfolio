"use client";

import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";

/**
 * Only mounted on the high tier. The composer adds two full-screen passes, and
 * on a phone that's the difference between a smooth scroll and a warm device —
 * the scene itself is cheap, the post is not.
 *
 * The threshold sits high on purpose: the screens are unlit and bright white,
 * and a lower cut would have the whole UI glowing like a lamp.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.96} luminanceSmoothing={0.25} intensity={0.5} />
      <Vignette offset={0.28} darkness={0.55} eskil={false} />
      <SMAA />
    </EffectComposer>
  );
}
