/**
 * Draws a synthesized app screen onto a canvas.
 *
 * Two of the featured projects can't ship real screenshots — one is client work
 * with no public listing, the other's store art isn't mine to redistribute — so
 * they get an honest, obviously-designed placeholder instead of a blank slab.
 *
 * The same canvas feeds both the DOM fallback and the three.js texture, so the
 * two never drift.
 */
export type MockKind = "feed" | "tracker";

export const MOCK_SIZE = { width: 720, height: 1280 };

const R = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

function statusBar(ctx: CanvasRenderingContext2D, fg: string) {
  ctx.fillStyle = fg;
  ctx.font = "600 26px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("9:41", 48, 46);

  // signal / wifi / battery, abstracted to simple marks
  for (let i = 0; i < 4; i++) {
    const h = 8 + i * 5;
    R(ctx, 560 + i * 11, 52 - h, 7, h, 2);
    ctx.fill();
  }
  R(ctx, 616, 34, 40, 22, 6);
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
  R(ctx, 620, 38, 30, 14, 3);
  ctx.fill();
}

function drawFeed(ctx: CanvasRenderingContext2D, accent: string) {
  const { width: W, height: H } = MOCK_SIZE;
  ctx.fillStyle = "#0c0e12";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#ffffff40";
  statusBar(ctx, "#e8eaee");

  // masthead
  ctx.fillStyle = "#e8eaee";
  ctx.font = "700 44px ui-serif, Georgia, serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Today", 48, 148);

  ctx.fillStyle = accent;
  R(ctx, 48, 172, 64, 4, 2);
  ctx.fill();

  // section chips
  const chips = [86, 120, 96, 108];
  let cx = 48;
  chips.forEach((w, i) => {
    ctx.fillStyle = i === 0 ? accent : "#ffffff12";
    R(ctx, cx, 214, w, 40, 20);
    ctx.fill();
    ctx.fillStyle = i === 0 ? "#0c0e12" : "#8a8f98";
    R(ctx, cx + 18, 231, w - 36, 7, 3.5);
    ctx.fill();
    cx += w + 12;
  });

  // lead story
  const grad = ctx.createLinearGradient(48, 288, 672, 560);
  grad.addColorStop(0, "#39414c");
  grad.addColorStop(1, "#1d222a");
  ctx.fillStyle = grad;
  R(ctx, 48, 288, 624, 272, 20);
  ctx.fill();
  ctx.fillStyle = accent;
  R(ctx, 72, 496, 96, 28, 14);
  ctx.fill();

  ctx.fillStyle = "#e8eaee";
  [560, 480].forEach((w, i) => {
    R(ctx, 48, 592 + i * 32, w, 16, 8);
    ctx.fill();
  });
  ctx.fillStyle = "#5a5f68";
  R(ctx, 48, 664, 220, 11, 5.5);
  ctx.fill();

  // story rows
  for (let i = 0; i < 3; i++) {
    const y = 720 + i * 132;
    ctx.fillStyle = "#252a33";
    R(ctx, 48, y, 132, 108, 14);
    ctx.fill();
    ctx.fillStyle = "#d4d7dc";
    R(ctx, 204, y + 8, 420, 14, 7);
    ctx.fill();
    R(ctx, 204, y + 36, 330, 14, 7);
    ctx.fill();
    ctx.fillStyle = "#4a4f58";
    R(ctx, 204, y + 76, 150, 10, 5);
    ctx.fill();
  }

  tabBar(ctx, accent, 5, 0);
}

function drawTracker(ctx: CanvasRenderingContext2D, accent: string) {
  const { width: W, height: H } = MOCK_SIZE;
  ctx.fillStyle = "#0b0f0c";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#ffffff40";
  statusBar(ctx, "#e8eaee");

  ctx.fillStyle = "#5a6058";
  ctx.font = "500 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("TODAY", 48, 150);
  ctx.fillStyle = "#e8eaee";
  ctx.font = "700 42px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("1,840 kcal", 48, 200);

  // calorie ring
  const cx = W / 2;
  const cy = 400;
  const r = 116;
  ctx.lineWidth = 26;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#ffffff14";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.34);
  ctx.stroke();

  ctx.fillStyle = "#e8eaee";
  ctx.font = "700 56px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("67%", cx, cy + 12);
  ctx.font = "500 20px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#5a6058";
  ctx.fillText("OF GOAL", cx, cy + 48);
  ctx.textAlign = "left";

  // macro bars
  const macros: [string, number, string][] = [
    ["Protein", 0.78, accent],
    ["Carbs", 0.54, "#6ea8fe"],
    ["Fat", 0.41, "#f0b354"],
  ];
  macros.forEach(([, pct, color], i) => {
    const y = 590 + i * 76;
    ctx.fillStyle = "#d4d7dc";
    R(ctx, 48, y, 96, 12, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff12";
    R(ctx, 48, y + 26, 624, 14, 7);
    ctx.fill();
    ctx.fillStyle = color;
    R(ctx, 48, y + 26, 624 * pct, 14, 7);
    ctx.fill();
  });

  // meal rows
  for (let i = 0; i < 2; i++) {
    const y = 850 + i * 116;
    ctx.fillStyle = "#141a15";
    R(ctx, 48, y, 624, 96, 16);
    ctx.fill();
    ctx.fillStyle = "#242c25";
    R(ctx, 68, y + 20, 56, 56, 12);
    ctx.fill();
    ctx.fillStyle = "#d4d7dc";
    R(ctx, 146, y + 28, 300, 13, 6.5);
    ctx.fill();
    ctx.fillStyle = "#4a5048";
    R(ctx, 146, y + 56, 170, 10, 5);
    ctx.fill();
    ctx.fillStyle = accent;
    R(ctx, 580, y + 40, 72, 14, 7);
    ctx.fill();
  }

  tabBar(ctx, accent, 4, 1);
}

function tabBar(
  ctx: CanvasRenderingContext2D,
  accent: string,
  count: number,
  active: number,
) {
  const { width: W, height: H } = MOCK_SIZE;
  ctx.fillStyle = "#ffffff0a";
  ctx.fillRect(0, H - 132, W, 1);
  const step = W / count;
  for (let i = 0; i < count; i++) {
    const x = step * i + step / 2;
    ctx.fillStyle = i === active ? accent : "#3d434c";
    ctx.beginPath();
    ctx.arc(x, H - 92, 13, 0, Math.PI * 2);
    ctx.fill();
    R(ctx, x - 22, H - 64, 44, 8, 4);
    ctx.fill();
  }
  // home indicator
  ctx.fillStyle = "#ffffff3d";
  R(ctx, W / 2 - 70, H - 26, 140, 8, 4);
  ctx.fill();
}

export function drawMockScreen(
  canvas: HTMLCanvasElement,
  kind: MockKind,
  accent: string,
) {
  canvas.width = MOCK_SIZE.width;
  canvas.height = MOCK_SIZE.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  if (kind === "tracker") drawTracker(ctx, accent);
  else drawFeed(ctx, accent);
  return canvas;
}

export function createMockCanvas(kind: MockKind, accent: string) {
  const canvas = document.createElement("canvas");
  return drawMockScreen(canvas, kind, accent);
}

/** Which mock a project uses when it has no real screenshots. */
export const MOCK_BY_SLUG: Record<string, MockKind> = {
  "philadelphia-inquirer": "feed",
  "caloer": "tracker",
};
