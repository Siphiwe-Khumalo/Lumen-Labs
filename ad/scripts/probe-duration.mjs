// Probe a media file's real duration and print durationInFrames @ the given fps.
// Primary: @remotion/media-parser parseMedia. Fallback: bundled ffprobe.
// Usage: node scripts/probe-duration.mjs <file> [fps=30]
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const file = process.argv[2];
const fps = Number(process.argv[3] ?? 30);

if (!file) {
  console.error("usage: node scripts/probe-duration.mjs <file> [fps]");
  process.exit(2);
}

async function viaMediaParser() {
  const { parseMedia } = await import("@remotion/media-parser");
  const { nodeReader } = await import("@remotion/media-parser/node");
  const { durationInSeconds } = await parseMedia({
    src: file,
    reader: nodeReader,
    fields: { durationInSeconds: true },
  });
  if (typeof durationInSeconds !== "number" || !isFinite(durationInSeconds)) {
    throw new Error("media-parser returned no duration");
  }
  return durationInSeconds;
}

function viaFfprobe() {
  const ffprobe =
    "node_modules/@remotion/compositor-linux-x64-gnu/ffprobe";
  if (!existsSync(ffprobe)) throw new Error("bundled ffprobe not found");
  const out = execFileSync(ffprobe, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nokey=1:noprint_wrappers=1",
    file,
  ]).toString().trim();
  const sec = Number(out);
  if (!isFinite(sec)) throw new Error("ffprobe returned no duration");
  return sec;
}

try {
  let seconds;
  try {
    seconds = await viaMediaParser();
  } catch {
    seconds = viaFfprobe();
  }
  const frames = Math.floor(seconds * fps);
  process.stdout.write(String(frames));
} catch (err) {
  console.error("probe failed:", err?.message ?? err);
  process.exit(1);
}
