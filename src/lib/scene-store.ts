"use client";

import { create } from "zustand";

type SceneStore = {
  /** True once the WebGL gallery is mounted and has drawn a frame. */
  active: boolean;
  setActive: (v: boolean) => void;
  /** Slug of the device the pointer is over, for label + cursor state. */
  hovered: string | null;
  setHovered: (v: string | null) => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  active: false,
  setActive: (active) => set({ active }),
  hovered: null,
  setHovered: (hovered) => set({ hovered }),
}));
