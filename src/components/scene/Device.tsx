"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { getSlot, HERO_ANCHOR } from "@/lib/device-slots";
import { useSceneStore } from "@/lib/scene-store";
import { createScreenMaterial } from "@/lib/screen-material";
import { roundedBoxGeometry, roundedPlaneGeometry, smoothstep } from "@/lib/geometry";
import { damp, mapRange, scrollState } from "@/lib/scroll";

/* Authored with body width = 1; the group is scaled to the slot's pixel width,
   so these read as fractions of the device's own width. */
const PAD = 0.011;
const DEPTH = 0.098;
const FACE_RADIUS = 0.095;
const SCREEN_RADIUS = 0.076;

/**
 * The pose a device settles into once it's docked in its work-section slot.
 *
 * Square-on, a phone in 3D is indistinguishable from a flat image — the whole
 * point of rendering it in WebGL is lost. A three-quarter turn catches the
 * lightformers down one edge and puts the bezel and buttons in view.
 *
 * The turn mirrors the layout: `Work` alternates which side the device sits on,
 * and the device angles back toward its own column of text rather than away
 * from it.
 */
const DOCKED = { yaw: 0.26, pitch: -0.05, roll: 0.035 };

/** How far scroll turns a docked device as it crosses the viewport. */
const SCROLL_SWEEP = { yaw: 0.2, pitch: 0.09 };

/**
 * Where each device sits in the hero cluster, as fractions of the hero anchor
 * box, before it flies out to its own slot in the work section.
 */
const HERO_POSES = [
  { x: -0.21, y: -0.03, z: 100, rx: -0.05, ry: 0.28, rz: -0.05, s: 0.4 },
  { x: 0.08, y: 0.17, z: -30, rx: -0.08, ry: 0.21, rz: 0.07, s: 0.33 },
  { x: 0.33, y: -0.2, z: -150, rx: 0.05, ry: 0.38, rz: -0.04, s: 0.28 },
];

export type DeviceProps = {
  slug: string;
  index: number;
  accent: string;
  aspect: number;
  textures: THREE.Texture[];
  /** False for reduced-motion visitors: the device holds a still pose. */
  motion: boolean;
};

export function Device({
  slug,
  index,
  accent,
  aspect,
  textures,
  motion,
}: DeviceProps) {
  const group = useRef<THREE.Group>(null);
  const router = useRouter();
  const size = useThree((s) => s.size);
  const setHovered = useSceneStore((s) => s.setHovered);

  const screenW = 1 - PAD * 2;
  const screenH = screenW / aspect;
  const bodyH = screenH + PAD * 2;

  const bodyGeo = useMemo(
    () => roundedBoxGeometry(1, bodyH, DEPTH, FACE_RADIUS, PAD),
    [bodyH],
  );
  const screenGeo = useMemo(
    () => roundedPlaneGeometry(screenW, screenH, SCREEN_RADIUS),
    [screenW, screenH],
  );
  const material = useMemo(() => createScreenMaterial(textures[0]), [textures]);

  useEffect(() => {
    return () => {
      bodyGeo.dispose();
      screenGeo.dispose();
      material.dispose();
    };
  }, [bodyGeo, screenGeo, material]);

  /** Mutable per-frame state, kept off React so nothing re-renders at 60fps. */
  const anim = useRef({
    hover: 0,
    targetHover: 0,
    cycleIndex: 0,
    cycleNext: 0,
    mixing: false,
    timer: index * 1.1, // stagger so the three devices don't flip in unison
    /** 0 → 1 over the first few frames the device is on screen. */
    appear: 0,
  });

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;

    // No slot on this route: stay hidden. Without this the group sits at its
    // default transform — origin, scale 1 — and a device authored at width 1
    // draws as a single lit pixel in the middle of the viewport.
    const slot = getSlot(slug);
    if (!slot) {
      g.visible = false;
      return;
    }
    g.visible = true;

    // Clamp: a background tab can hand back a delta of several seconds.
    const delta = Math.min(dt, 1 / 30);

    // --- where the DOM says this device belongs -------------------------
    const rect = slot.getBoundingClientRect();
    const slotX = rect.left + rect.width / 2 - size.width / 2;
    const slotY = -(rect.top + rect.height / 2 - size.height / 2);
    const slotScale = rect.width;

    // --- blend from the hero cluster into that slot ---------------------
    const anchor = getSlot(HERO_ANCHOR);
    const anchorRect = anchor?.getBoundingClientRect();
    /* A zero-width rect means the anchor is display:none (below md) or has been
       detached. Either way there's no hero cluster to blend out of, so the
       device just sits in its slot rather than collapsing to a dot at the
       viewport's top-left corner. */
    const useHero =
      motion && anchorRect !== undefined && anchorRect.width > 1 && size.width >= 900;
    let t = 1;
    let x = slotX;
    let y = slotY;
    let z = 0;
    let scale = slotScale;

    /* Odd-indexed projects sit in the right-hand column, so their devices turn
       the other way. Matches the `flip` in components/sections/Work.tsx. */
    const facing = index % 2 === 1 ? -1 : 1;

    /*
     * Scroll position of this slot, -1 (entering from the bottom) through 0
     * (dead centre) to +1 (leaving past the top). Turning the device by this
     * makes scrolling feel like rotating the object rather than sliding a
     * picture past.
     */
    const fromCentre = THREE.MathUtils.clamp(
      (size.height / 2 - (rect.top + rect.height / 2)) / (size.height / 2),
      -1,
      1,
    );

    let restYaw = facing * DOCKED.yaw;
    let restPitch = DOCKED.pitch;
    const restRoll = facing * -DOCKED.roll;

    if (motion) {
      restYaw -= fromCentre * SCROLL_SWEEP.yaw * facing;
      restPitch += fromCentre * SCROLL_SWEEP.pitch;
    }

    let rx = restPitch;
    let ry = restYaw;
    let rz = restRoll;
    // Turning the device narrows its silhouette; widen it back so it still
    // fills the box the layout reserved.
    scale /= Math.cos(Math.min(Math.abs(restYaw), 1.2));
    // Comes forward as it passes the middle of the screen.
    if (motion) z += (1 - Math.abs(fromCentre)) * 26;

    if (useHero && anchorRect) {
      const a = anchorRect;
      const pose = HERO_POSES[index % HERO_POSES.length];
      const heroX = a.left + a.width / 2 - size.width / 2 + pose.x * a.width;
      const heroY = -(a.top + a.height / 2 - size.height / 2) + pose.y * a.height;
      const heroScale = pose.s * a.width;

      // Finishes inside the first ~60% of a viewport height: any longer and
      // the devices are still crossing the middle of the screen when the
      // work section's intro text scrolls up behind them.
      t = smoothstep(mapRange(scrollState.y, 0, size.height * 0.6, 0, 1));
      x = THREE.MathUtils.lerp(heroX, slotX, t);
      y = THREE.MathUtils.lerp(heroY, slotY, t);
      scale = THREE.MathUtils.lerp(heroScale, scale, t);
      z = THREE.MathUtils.lerp(pose.z, z, t);
      rx = THREE.MathUtils.lerp(pose.rx, restPitch, t);
      ry = THREE.MathUtils.lerp(pose.ry, restYaw, t);
      rz = THREE.MathUtils.lerp(pose.rz, restRoll, t);
    }

    // --- idle life ------------------------------------------------------
    if (motion) {
      const time = state.clock.elapsedTime;
      y += Math.sin(time * 0.55 + index * 1.9) * 0.012 * scale;
      rx += Math.sin(time * 0.47 + index * 1.3) * 0.028;
      ry += Math.cos(time * 0.39 + index * 2.1) * 0.05;
      // Pointer parallax, eased out while the devices are still clustered.
      ry += state.pointer.x * 0.11;
      rx += -state.pointer.y * 0.07;
    }

    // --- hover ----------------------------------------------------------
    // Straightens up to face the viewer and steps forward. A tilted device
    // reads as an object; squaring up on hover is what makes it feel like an
    // object you can pick up.
    const a2 = anim.current;
    a2.hover = damp(a2.hover, a2.targetHover, 9, delta);
    const square = a2.hover * 0.88;
    rx = THREE.MathUtils.lerp(rx, 0, square);
    ry = THREE.MathUtils.lerp(ry, 0, square);
    rz = THREE.MathUtils.lerp(rz, 0, square);
    z += a2.hover * 70;

    /* --- arrival --------------------------------------------------------
     * The CSS device frame underneath is cross-fading out over 700ms
     * (DeviceSlot), and a WebGL device that snaps in at full size and full
     * brightness halfway through that fade reads as a glitch. Coming up
     * slightly small and dark instead makes the handoff look like the screen
     * waking, which is what it is. */
    a2.appear = damp(a2.appear, 1, 3.6, delta);
    scale *= 0.94 + a2.appear * 0.06;
    material.uniforms.uBrightness.value = (1 + a2.hover * 0.14) * (0.2 + a2.appear * 0.8);

    // Position is set, not damped: the device is pinned to a DOM box, and
    // easing toward it would let it drift behind the layout while scrolling.
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    g.rotation.set(rx, ry, rz);

    // --- screenshot wipe ------------------------------------------------
    if (motion && textures.length > 1) {
      if (a2.mixing) {
        const next = material.uniforms.uMix.value + delta / 0.6;
        if (next >= 1) {
          material.uniforms.uMapA.value = textures[a2.cycleNext];
          material.uniforms.uMix.value = 0;
          a2.cycleIndex = a2.cycleNext;
          a2.mixing = false;
          a2.timer = 0;
        } else {
          material.uniforms.uMix.value = next;
        }
      } else {
        a2.timer += delta;
        if (a2.timer > 4.2) {
          a2.cycleNext = (a2.cycleIndex + 1) % textures.length;
          material.uniforms.uMapB.value = textures[a2.cycleNext];
          a2.mixing = true;
        }
      }
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    anim.current.targetHover = 1;
    setHovered(slug);
  };
  const onOut = () => {
    anim.current.targetHover = 0;
    setHovered(null);
  };

  return (
    <group
      ref={group}
      visible={false}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/work/${slug}`);
      }}
    >
      <mesh geometry={bodyGeo} castShadow={false}>
        <meshStandardMaterial
          color="#16181c"
          metalness={0.92}
          roughness={0.29}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Screen: unlit, so the app renders at its true brightness. */}
      <mesh geometry={screenGeo} position={[0, 0, DEPTH / 2 + 0.0015]}>
        <primitive object={material} attach="material" />
      </mesh>

      {/* Cover glass: a thin reflective layer that picks up the lightformers. */}
      <mesh geometry={screenGeo} position={[0, 0, DEPTH / 2 + 0.004]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.09}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={2.4}
          depthWrite={false}
        />
      </mesh>

      {/* Side buttons — small, but their absence is what makes a 3D phone
          read as a slab. */}
      {[
        { x: -0.5, y: bodyH * 0.2, h: 0.1 },
        { x: -0.5, y: bodyH * 0.08, h: 0.1 },
        { x: 0.5, y: bodyH * 0.15, h: 0.15 },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0]}>
          <boxGeometry args={[0.014, b.h, DEPTH * 0.55]} />
          <meshStandardMaterial color="#23262b" metalness={0.95} roughness={0.35} />
        </mesh>
      ))}

      {/* Back camera module, for when the device is turned in the hero. */}
      <group position={[-0.27, bodyH / 2 - 0.28, -DEPTH / 2 - 0.012]}>
        <mesh>
          <boxGeometry args={[0.34, 0.34, 0.024]} />
          <meshStandardMaterial color="#1a1c20" metalness={0.9} roughness={0.4} />
        </mesh>
        {[
          [-0.07, 0.07],
          [0.07, -0.07],
        ].map(([cx, cy], i) => (
          <mesh key={i} position={[cx, cy, -0.016]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.016, 20]} />
            <meshStandardMaterial color="#0a0b0d" metalness={1} roughness={0.12} />
          </mesh>
        ))}
      </group>

      {/* A faint wash of the project's accent, so each device sits in its own
          pool of colour rather than all three sharing one grey studio. */}
      <pointLight
        position={[0, 0, 0.9]}
        color={accent}
        intensity={2.2}
        distance={3.2}
        decay={2}
      />
    </group>
  );
}
