"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * A studio built out of lightformers instead of an HDRI.
 *
 * drei's <Environment preset> downloads a multi-megabyte .hdr from a CDN. Five
 * emissive rectangles rendered to a 256px cubemap give brushed metal and cover
 * glass the same long soft highlights for zero network cost — and unlike a
 * photograph, the reflections can be art-directed.
 *
 * frames={1} bakes it once: nothing in here moves.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 8]} intensity={1.1} color="#dfe7ff" />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#05060a"]} />

        {/* Broad soft key, top-left — the primary highlight down the bezel. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#ffffff"
          position={[-4, 3, 4]}
          scale={[8, 10, 1]}
          target={[0, 0, 0]}
        />

        {/* Two narrow rim strips: these are what read as polished metal. */}
        <Lightformer
          form="rect"
          intensity={4.5}
          color="#cfe0ff"
          position={[5, 1, 2]}
          scale={[0.6, 12, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#ffffff"
          position={[-5, -2, 1]}
          scale={[0.4, 10, 1]}
          target={[0, 0, 0]}
        />

        {/* Warm accent from below, so the shadow side isn't dead grey. */}
        <Lightformer
          form="circle"
          intensity={1.8}
          color="#ffb877"
          position={[2, -4, 3]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />

        {/* Cool fill behind, separating the device from the page. */}
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#4a6fff"
          position={[0, 2, -6]}
          scale={[10, 10, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
    </>
  );
}
