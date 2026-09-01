"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Preload, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Device } from "@/components/scene/Device";
import { Lighting } from "@/components/scene/Lighting";
import { Effects } from "@/components/scene/Effects";
import { createMockCanvas, MOCK_BY_SLUG } from "@/lib/mock-screen";
import { prepareScreenTexture } from "@/lib/screen-material";
import { hasSlots, onSlotsChanged } from "@/lib/device-slots";
import { useSceneStore } from "@/lib/scene-store";
import { useIntroStore } from "@/lib/intro-store";
import type { Tier } from "@/lib/tier";

export type DeviceSpec = {
  slug: string;
  accent: string;
  aspect: number;
  screens: string[];
  /** True only when `screens` are bare captures, safe to map onto a device. */
  deviceScreens: boolean;
};

/** Distance from the camera to the z=0 plane, in pixels. */
const CAMERA_DISTANCE = 1500;

/**
 * Puts the camera where one world unit equals one CSS pixel at z=0.
 *
 * That's what lets the gallery position devices straight from
 * getBoundingClientRect() — layout stays a CSS problem, and the WebGL and
 * no-WebGL versions of the page agree by construction rather than by tuning.
 */
function PixelPerfectCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.fov = 2 * Math.atan(size.height / 2 / CAMERA_DISTANCE) * (180 / Math.PI);
    camera.near = 10;
    camera.far = CAMERA_DISTANCE * 3;
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

/**
 * Stops the render loop whenever there's nothing to draw.
 *
 * The canvas lives in the root layout so the WebGL context and the uploaded
 * textures survive navigation — going back from a case study shouldn't cost a
 * fresh 1.1MB parse and a texture re-upload. The price of that is a canvas
 * mounted on routes with no devices, which this hands back by parking the
 * loop. A hidden tab gets the same treatment.
 */
function FrameloopGuard() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const update = () => {
      const live = hasSlots() && !document.hidden;
      setFrameloop(live ? "always" : "never");
      /* Nothing will draw on a route with no devices, so <ReadySignal> can't
         fire — tell the arrival overlay the scene is as ready as it gets
         rather than leaving it to time out. */
      if (!hasSlots()) useIntroStore.getState().mark("sceneReady");
      // Parking the loop freezes whatever was drawn last, so a case study
      // would keep the home page's devices painted behind it. Clear once the
      // loop has actually stopped.
      if (!live) requestAnimationFrame(() => gl.clear());
    };
    update();
    const unsubscribe = onSlotsChanged(update);
    document.addEventListener("visibilitychange", update);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", update);
    };
  }, [setFrameloop, gl]);

  return null;
}

/**
 * Flips the store once a frame has actually been drawn, so the CSS device
 * frames fade out only after there's something to replace them.
 *
 * Reads the live store value rather than latching a ref. A ref-latched version
 * deadlocks under StrictMode's mount → cleanup → mount cycle: the ref survives,
 * so after the cleanup sets `active` back to false nothing ever sets it true
 * again, and the flat CSS phone sits visible behind every 3D device.
 */
function ReadySignal() {
  const setActive = useSceneStore((s) => s.setActive);

  useFrame(() => {
    if (!useSceneStore.getState().active) {
      setActive(true);
      // The arrival overlay waits on this: it should lift onto devices that
      // are already drawn, not onto the CSS frames mid-crossfade.
      useIntroStore.getState().mark("sceneReady");
    }
  });

  useEffect(() => () => useSceneStore.getState().setActive(false), []);
  return null;
}

function Gallery({ devices, motion }: { devices: DeviceSpec[]; motion: boolean }) {
  const gl = useThree((s) => s.gl);
  const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  // One loader call with a stable list — useTexture is a suspense hook and
  // can't be called per-project behind a condition.
  const realPaths = useMemo(
    () => devices.filter((d) => d.deviceScreens).flatMap((d) => d.screens),
    [devices],
  );
  const loaded = useTexture(realPaths);
  const byPath = useMemo(() => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    const map = new Map<string, THREE.Texture>();
    realPaths.forEach((p, i) => {
      if (list[i]) map.set(p, prepareScreenTexture(list[i], anisotropy));
    });
    return map;
  }, [loaded, realPaths, anisotropy]);

  // Projects with no publishable screenshots draw their placeholder UI to a
  // canvas — the same routine the DOM fallback uses, so the two can't drift.
  const mocks = useMemo(() => {
    const map = new Map<string, THREE.Texture>();
    for (const d of devices) {
      if (d.deviceScreens) continue;
      const texture = new THREE.CanvasTexture(
        createMockCanvas(MOCK_BY_SLUG[d.slug] ?? "feed", d.accent),
      );
      map.set(d.slug, prepareScreenTexture(texture, anisotropy));
    }
    return map;
  }, [devices, anisotropy]);

  useEffect(() => {
    const textures = [...mocks.values()];
    return () => textures.forEach((t) => t.dispose());
  }, [mocks]);

  return (
    <>
      {devices.map((d, i) => {
        const textures = d.deviceScreens
          ? d.screens.map((p) => byPath.get(p)).filter((t): t is THREE.Texture => Boolean(t))
          : [mocks.get(d.slug)!];
        if (!textures.length) return null;
        return (
          <Device
            key={d.slug}
            slug={d.slug}
            index={i}
            accent={d.accent}
            aspect={d.aspect}
            textures={textures}
            motion={motion}
          />
        );
      })}
    </>
  );
}

export default function Scene({ devices, tier }: { devices: DeviceSpec[]; tier: Tier }) {
  const motion = !tier.reducedMotion;
  const [dpr, setDpr] = useState(tier.level === "high" ? 1.75 : 1.25);
  const [post, setPost] = useState(tier.level === "high");
  const hovered = useSceneStore((s) => s.hovered);

  // The canvas can't set the cursor itself — it's pointer-events:none so the
  // page underneath stays clickable — so the hover state drives the body.
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
        dpr={dpr}
        gl={{
          alpha: true,
          antialias: !post,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0, CAMERA_DISTANCE], fov: 40 }}
        style={{ pointerEvents: "none" }}
      >
        <PixelPerfectCamera />
        <FrameloopGuard />
        <ReadySignal />

        {/* Steps quality down rather than dropping frames on a weaker GPU. */}
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setPost(false);
          }}
        />

        <Lighting />
        <Gallery devices={devices} motion={motion} />
        {post && <Effects />}
        <Preload all />
      </Canvas>
    </div>
  );
}
