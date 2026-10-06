// Parse each vo*.vtt's last-cue end time and print a JSON map of
// { id: { endSeconds, durationInFrames } } @ the given fps. Consumed by
// generate-vo.sh and (indirectly) by FEAT-003's narration.ts.
// Usage: node scripts/measure-vo.mjs <vo-dir> [fps=30]
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const fps = Number(process.argv[3] ?? 30);

if (!dir) {
  console.error("usage: node scripts/measure-vo.mjs <vo-dir> [fps]");
  process.exit(2);
}

// VTT timestamp -> seconds. Accepts HH:MM:SS.mmm or MM:SS.mmm (',' or '.').
function tsToSeconds(ts) {
  const norm = ts.trim().replace(",", ".");
  const parts = norm.split(":").map(Number);
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else s = parts[0];
  return h * 3600 + m * 60 + s;
}

const cueRe =
  /(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3})/g;

const files = readdirSync(dir)
  .filter((f) => /^vo\d{2}\.vtt$/.test(f))
  .sort();

const out = {};
for (const f of files) {
  const id = f.replace(/\.vtt$/, "");
  const text = readFileSync(join(dir, f), "utf8");
  let m;
  let lastEnd = 0;
  cueRe.lastIndex = 0;
  while ((m = cueRe.exec(text)) !== null) {
    const end = tsToSeconds(m[2]);
    if (end > lastEnd) lastEnd = end;
  }
  if (lastEnd <= 0) {
    console.error(`WARN: no cue end found in ${f}`);
  }
  out[id] = {
    endSeconds: Number(lastEnd.toFixed(3)),
    durationInFrames: Math.ceil(lastEnd * fps),
  };
}

process.stdout.write(JSON.stringify(out, null, 2) + "\n");
