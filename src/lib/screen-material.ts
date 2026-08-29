import * as THREE from "three";

/**
 * Wipes between two screenshots on the device screen.
 *
 * Written as a plain ShaderMaterial rather than a drei `shaderMaterial` so it
 * needs no JSX element augmentation — it's attached with <primitive/>.
 *
 * The screen is unlit and untonemapped on purpose: an app screenshot should
 * read at its true brightness, like a display emitting light, not like a piece
 * of paper being lit by the scene.
 */
export function createScreenMaterial(initial: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMapA: { value: initial },
      uMapB: { value: initial },
      uMix: { value: 0 },
      /** Lifted slightly when the device is hovered, like a screen waking. */
      uBrightness: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMapA;
      uniform sampler2D uMapB;
      uniform float uMix;
      uniform float uBrightness;
      varying vec2 vUv;

      void main() {
        vec4 a = texture2D(uMapA, vUv);
        vec4 b = texture2D(uMapB, vUv);

        /*
         * A soft wipe, not a cross-dissolve.
         *
         * Dissolving between two dissimilar app screens shows both at once —
         * two tab bars, two headlines — which reads as a rendering fault
         * rather than a transition, and any screenshot taken mid-fade catches
         * it. A wipe only ever shows one screen at any given pixel.
         *
         * The boundary starts and ends outside 0..1 so the wipe fully clears
         * the screen at both ends, which also self-gates the edge highlight.
         */
        float boundary = mix(-0.10, 1.10, uMix);
        // A narrow blend band: wide enough not to alias on the diagonal, tight
        // enough that the two screens never overlap across the whole device.
        float wipe = smoothstep(boundary - 0.07, boundary + 0.07, vUv.x);
        vec3 color = mix(b.rgb, a.rgb, wipe) * uBrightness;

        // A slim bright edge travelling with the boundary, so the change reads
        // as deliberate rather than as a glitch.
        color += (1.0 - smoothstep(0.0, 0.05, abs(vUv.x - boundary))) * 0.14;

        // A faint diagonal gradient across the glass so a perfectly flat
        // screenshot still reads as a lit surface at grazing angles.
        float sheen = smoothstep(0.0, 1.6, vUv.x + vUv.y) * 0.05;
        gl_FragColor = vec4(color + sheen, 1.0);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  });
}

/** Textures fed to the screen shader must be sRGB or the UI looks washed out. */
export function prepareScreenTexture(texture: THREE.Texture, anisotropy: number) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
