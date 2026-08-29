/**
 * Renders the Word CV to public/cv.pdf so the "Download CV" button serves a
 * real file.
 *
 * macOS only, and deliberately best-effort: `textutil` keeps the text, the
 * headings and the colours but substitutes fonts, so the result is a faithful
 * *readable* CV rather than a pixel copy of the Word layout. Exporting to PDF
 * from Word and dropping it at public/cv.pdf gives a better-looking file and
 * this script will happily be skipped.
 *
 *   node scripts/build-cv-pdf.mjs [path/to/resume.docx]
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "cv.pdf");
const SOURCE =
  process.argv[2] ??
  path.join(ROOT, "..", "resume", "Resume-Nguyen_ThanhLong-Singapore.docx");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function bail(message) {
  console.error(`\n✗ ${message}`);
  console.error("  Export the CV to PDF from Word and save it as public/cv.pdf instead.");
  process.exit(1);
}

if (!existsSync(SOURCE)) bail(`No .docx at ${SOURCE}`);
if (!existsSync(CHROME)) bail("Google Chrome not found — it does the PDF rendering.");
if (spawnSync("which", ["textutil"]).status !== 0) bail("`textutil` not available (macOS only).");

const work = mkdtempSync(path.join(tmpdir(), "cv-"));
const docx = path.join(work, "source.docx");
const html = path.join(work, "cv.html");

// textutil refuses paths it can't reach through the sandbox; copying first is
// both simpler and more reliable than fighting that.
writeFileSync(docx, readFileSync(SOURCE));

const convert = spawnSync("textutil", ["-convert", "html", "-output", html, docx]);
if (convert.status !== 0) bail(`textutil failed: ${convert.stderr}`);

// Give the converted markup print margins and a sane font stack. textutil
// hard-codes Times at Word's point sizes, which prints small and dated.
const converted = readFileSync(html, "utf8");
const styled = converted.replace(
  "</head>",
  `<style>
      @page { size: A4; margin: 14mm 15mm; }
      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important; }
      p, li, td, span { font-family: inherit !important; }
      p { line-height: 1.45; }
      a { color: inherit; text-decoration: none; }
    </style></head>`,
);
writeFileSync(html, styled);

const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(work, "profile")}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function debuggerUrl() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(100);
  }
  throw new Error("Chrome never opened its debugging port");
}

try {
  const ws = new WebSocket(await debuggerUrl());
  await new Promise((resolve) => (ws.onopen = resolve));

  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve) => {
      const next = ++id;
      pending.set(next, resolve);
      ws.send(JSON.stringify({ id: next, method, params, sessionId }));
    });

  const target = await send("Target.createTarget", { url: "about:blank" });
  const attached = await send("Target.attachToTarget", {
    targetId: target.result.targetId,
    flatten: true,
  });
  const session = attached.result.sessionId;

  await send("Page.enable", {}, session);
  await send("Page.navigate", { url: `file://${html}` }, session);
  await sleep(1200);

  const pdf = await send(
    "Page.printToPDF",
    { printBackground: true, preferCSSPageSize: true },
    session,
  );
  writeFileSync(OUT, Buffer.from(pdf.result.data, "base64"));
  ws.close();

  const kb = (readFileSync(OUT).length / 1024).toFixed(0);
  console.log(`✓ public/cv.pdf — ${kb} KB, from ${path.basename(SOURCE)}`);
} finally {
  chrome.kill();
}
process.exit(0);
