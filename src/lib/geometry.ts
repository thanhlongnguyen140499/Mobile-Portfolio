import * as THREE from "three";

function roundedRectShape(w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  const x = -w / 2;
  const y = -h / 2;

  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + w - radius, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + radius);
  shape.lineTo(x + w, y + h - radius);
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  shape.lineTo(x + radius, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/**
 * A flat rounded rectangle with UVs remapped to 0…1.
 *
 * ShapeGeometry derives UVs straight from vertex positions, which for a shape
 * centred on the origin gives coordinates in [-w/2, w/2] — a texture mapped
 * onto it would be wildly wrong. Remapping over the bounding box fixes it.
 *
 * The screen needs rounded corners of its own: it's inset from the body by
 * ~1% while the body's corner radius is ~9%, so a square-cornered plane would
 * poke out past the rounded shell at every corner.
 */
export function roundedPlaneGeometry(w: number, h: number, r: number, curveSegments = 10) {
  const geometry = new THREE.ShapeGeometry(roundedRectShape(w, h, r), curveSegments);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const x = -w / 2;
  const y = -h / 2;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - x) / w, (position.getY(i) - y) / h);
  }
  uv.needsUpdate = true;
  return geometry;
}

/**
 * The phone body: a rounded rectangle extruded with a bevelled edge.
 *
 * drei's <RoundedBox> can't do this — it rounds with a single radius clamped to
 * half the smallest dimension, so on something as thin as a phone the face
 * corners collapse to the thickness of the device and the screen pokes out past
 * them. Extruding the face profile keeps the 9%-of-width face radius while the
 * bevel does the job of the polished edge.
 */
export function roundedBoxGeometry(w: number, h: number, d: number, r: number, bevel = 0.011) {
  const depth = Math.max(0.001, d - bevel * 2);
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/** Smooth Hermite step — the standard ease for a 0→1 transition. */
export function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
