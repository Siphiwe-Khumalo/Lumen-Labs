#!/usr/bin/env python3
"""
Lumen Labs 30s TikTok Ad — v2 build.
Fixes: per-clip crop positions, better footage assignments, fixed overlay timing,
brightness corrections for dark clips.

Approach: 
- Render text overlays directly with ffmpeg drawtext (no PNG sequences)
- Use per-clip crop positions to capture the interesting part of each shot
- Single-pass ffmpeg assembly with complex filtergraph
"""
import os
import subprocess
import json
import math
from PIL import Image, ImageDraw, ImageFont

PROJ = "/projects/sandbox/lumen-tiktok"
VID_DIR = f"{PROJ}/assets/videos"
FONT_DIR = f"{PROJ}/assets/fonts"
CLIP_DIR = f"{PROJ}/clips_v2"
TEXT_DIR = f"{PROJ}/text_overlays_v2"
OUT_DIR = f"{PROJ}/output"

os.makedirs(CLIP_DIR, exist_ok=True)
os.makedirs(TEXT_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1080, 1920
FPS = 30

# ============================================================================
# UPDATED SHOT TIMELINE with better footage assignments + per-clip crop
# crop_x_mode: "left", "center", "right", or explicit pixel offset
# ============================================================================
SHOTS = [
    # (clip_name, video_start, duration, src_start, treatment, crop_x)
    # HOOK (0-5.6s)
    ("hook_city",       0.00, 2.00, 3.0,  "dark_push",  "center"),
    ("data_viz",        2.00, 1.60, 6.0,  "cool",       "center"),   # trading screen (dense data)
    ("code_screen",     3.60, 2.00, 4.0,  "dark_push",  "left"),     # real code + dev reflection

    # PROBLEM (5.6-14.2s)
    ("workspace_detail",5.60, 1.70, 3.0,  "warm",       "center"),   # typing on laptop
    ("editing_screen",  7.30, 1.70, 3.0,  "cool",       "center"),   # software screen
    ("mobile_phone",    9.00, 1.60, 2.0,  "warm",       "center"),   # phone in hand, city bg
    ("office_team",     10.60,1.80, 2.0,  "left",       "left"),     # whiteboard diagrams
    ("dashboard",       12.40,1.80, 10.0, "cool",       "center"),   # data overload = complicated

    # SOLUTION (14.2-27.0s)
    ("pc_working",      14.20,2.10, 3.0,  "hero",       "center"),   # dev at iMac — the team
    ("code_screen",     16.30,1.70, 7.0,  "amber",      "left"),     # SOFTWARE (real code)
    ("editing_screen",  18.00,1.70, 7.0,  "amber",      "center"),   # WEB APPS (screen)
    ("circuit_board",   19.70,1.70, 2.0,  "amber",      "center"),   # CLOUD · INFRA (router LEDs)
    ("cable_connect",   21.40,1.70, 2.0,  "amber",      "center"),   # NETWORKING (cable)
    ("cyber_security",  23.10,1.70, 3.0,  "amber",      "center"),   # SECURITY
    ("cloud_new",       24.80,1.50, 2.0,  "amber",      "center"),   # VoIP / IoT (device setup)
    ("router_ports",    26.30,0.70, 2.0,  "amber",      "center"),   # ALL OF IT (router ports)

    # BRAND (27.0-30.0s)
    ("hook_city",       27.00,3.00, 7.0,  "brand_dark", "center"),
]

# ============================================================================
# TEXT OVERLAYS
# ============================================================================
TEXT_OVERLAYS = [
    (0.55,  2.40, "statement",       ["Your business doesn't", "need more technology."]),
    (3.45,  2.10, "statement_accent",["It needs the", "RIGHT technology."]),
    (5.80,  1.90, "quiet",           ["Everything runs on tech."]),
    (8.00,  3.90, "kinetic",         ["apps.", "systems.", "screens."]),
    (12.10, 1.90, "quiet_amber",     ["It gets complicated."]),
    (14.20, 1.90, "statement",       ["That's where", "we come in."]),
    (16.30, 1.55, "keyword",         ["SOFTWARE"]),
    (18.00, 1.55, "keyword",         ["WEB APPS"]),
    (19.70, 1.55, "keyword",         ["CLOUD · INFRA"]),
    (21.40, 1.55, "keyword",         ["NETWORKING"]),
    (23.10, 1.55, "keyword",         ["SECURITY · CCTV"]),
    (24.80, 1.35, "keyword",         ["VoIP · IoT"]),
    (26.30, 0.65, "keyword_accent",  ["ALL OF IT."]),
    (27.15, 1.55, "brand",           ["LUMEN LABS"]),
    (28.70, 1.25, "brand_tag",       ["Built with intention."]),
]


def run(cmd, timeout=300):
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        print(f"  ERR: {r.stderr[-300:]}")
    return r.returncode == 0


def get_crop_x(mode, src_w=1920, crop_w=608):
    """Calculate crop X position."""
    if mode == "left":
        return max(0, int(src_w * 0.1))  # 10% from left
    elif mode == "right":
        return int(src_w * 0.6)
    elif mode == "center":
        return (src_w - crop_w) // 2
    elif isinstance(mode, int):
        return mode
    return (src_w - crop_w) // 2


# ============================================================================
# STEP 1: Prepare clips with per-clip crop positions
# ============================================================================
def prepare_clips():
    print("=== Preparing clips (v2) ===")
    for clip_name, vid_start, duration, src_start, treatment, crop_x_mode in SHOTS:
        out_path = os.path.join(CLIP_DIR, f"shot_{vid_start:.2f}.mp4")
        if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
            print(f"  SKIP (exists): {clip_name} @{vid_start:.1f}s")
            continue
        src = os.path.join(VID_DIR, f"{clip_name}.mp4")
        if not os.path.exists(src):
            print(f"  MISSING: {src}")
            continue

        # Get source dimensions
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height", "-of", "csv=p=0", src],
            capture_output=True, text=True
        )
        parts = probe.stdout.strip().split(",")
        src_w, src_h = int(parts[0]), int(parts[1])

        # Calculate crop: source is landscape, target is 9:16
        # crop_w = src_h * 9/16
        crop_w = int(src_h * 9 / 16)
        crop_h = src_h
        crop_x = get_crop_x(crop_x_mode, src_w, crop_w)
        crop_x = min(crop_x, src_w - crop_w)  # clamp

        # Color grading per treatment
        grade_filters = {
            "dark_push":  "curves=all='0/0 0.15/0.10 0.5/0.42 0.85/0.75 1/0.88'",
            "cool":       "curves=all='0/0 0.3/0.24 0.6/0.54 1/0.84',hue=s=0.78",
            "warm":       "curves=all='0/0 0.3/0.27 0.7/0.68 1/0.93',hue=h=5",
            "left":       "curves=all='0/0 0.3/0.26 0.7/0.66 1/0.92'",  # neutral, for whiteboard
            "hero":       "curves=all='0/0 0.2/0.17 0.5/0.47 0.8/0.79 1/0.93'",
            "amber":      "curves=all='0/0 0.2/0.17 0.5/0.48 1/0.90',hue=h=8:s=0.90",
            "brand_dark": "curves=all='0/0 0.3/0.16 0.6/0.36 1/0.66'",
        }
        grade = grade_filters.get(treatment, "curves=all='0/0 0.5/0.45 1/0.9'")

        # Extra brightness boost for the dark code_screen clip so code is readable.
        # Stronger in the solution ("amber") context where it must clearly read as SOFTWARE.
        if clip_name == "code_screen":
            if treatment == "amber":
                grade = "eq=brightness=0.20:contrast=1.45:saturation=1.35," + grade
            else:
                grade = "eq=brightness=0.10:contrast=1.2:saturation=1.15," + grade

        speed = "0.85" if treatment != "brand_dark" else "0.7"

        vf = (
            f"crop={crop_w}:{crop_h}:{crop_x}:0,"
            f"scale={W}:{H}:flags=lanczos,"
            f"{grade},"
            f"setpts=PTS/{speed}"
        )

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(src_start),
            "-t", str(duration * 2),  # extra for speed change
            "-i", src,
            "-vf", vf,
            "-t", str(duration),
            "-r", str(FPS),
            "-c:v", "libx264", "-preset", "fast", "-crf", "18",
            "-an",
            out_path,
        ]
        print(f"  Clip: {clip_name} @{vid_start:.1f}s ({treatment}, crop_x={crop_x})")
        run(cmd)

    # Verify all clips
    total_dur = 0
    for clip_name, vid_start, duration, _, _, _ in SHOTS:
        out_path = os.path.join(CLIP_DIR, f"shot_{vid_start:.2f}.mp4")
        if os.path.exists(out_path):
            p = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out_path],
                capture_output=True, text=True)
            d = float(p.stdout.strip())
            total_dur += d
    print(f"  Total clip duration: {total_dur:.2f}s")


# ============================================================================
# STEP 2: Generate text overlay PNG sequences (FIXED timing)
# ============================================================================
AMBER = (240, 170, 70)
AMBER_HOT = (255, 195, 95)
OFF_WHITE = (238, 238, 240)
MUTED = (130, 135, 145)

def font(weight="Inter-Bold.ttf", size=48):
    return ImageFont.truetype(os.path.join(FONT_DIR, weight), size)

def ease_out_cubic(t):
    t = max(0, min(t, 1))
    return 1 - (1 - t) ** 3

def render_text_overlay(idx, start, dur, kind, lines):
    """Render a single text overlay as a PNG sequence."""
    overlay_dir = os.path.join(TEXT_DIR, f"text_{idx:02d}")
    os.makedirs(overlay_dir, exist_ok=True)

    num_frames = int(dur * FPS) + 1
    for frame_i in range(num_frames):
        t = frame_i / max(num_frames - 1, 1)  # 0..1

        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Common animation: fade in/out
        fade_in = ease_out_cubic(min(t / 0.15, 1.0))
        fade_out = ease_out_cubic(min((1 - t) / 0.12, 1.0))
        alpha = fade_in * fade_out
        slide = (1 - ease_out_cubic(min(t / 0.25, 1.0))) * 40

        if kind == "statement":
            _draw_statement(draw, lines, alpha, slide, OFF_WHITE, OFF_WHITE)
        elif kind == "statement_accent":
            _draw_statement(draw, lines, alpha, slide, OFF_WHITE, AMBER)
        elif kind == "quiet":
            _draw_quiet(draw, lines[0], alpha, OFF_WHITE)
        elif kind == "quiet_amber":
            _draw_quiet(draw, lines[0], alpha, AMBER)
        elif kind == "kinetic":
            _draw_kinetic(draw, lines, t, alpha)
        elif kind == "keyword":
            _draw_keyword(draw, lines[0], t, alpha, OFF_WHITE)
        elif kind == "keyword_accent":
            _draw_keyword(draw, lines[0], t, alpha, AMBER_HOT)
        elif kind == "brand":
            _draw_brand(draw, lines[0], t, alpha)
        elif kind == "brand_tag":
            _draw_brand_tag(draw, lines[0], t, alpha)

        img.save(os.path.join(overlay_dir, f"{frame_i:04d}.png"))

    return num_frames


def _draw_statement(draw, lines, alpha, slide, color1, color2):
    f = font("InterDisplay-Bold.ttf", 58)
    y_base = H * 0.42 + slide
    gap = 76
    total = gap * len(lines)
    y = y_base - total / 2
    for i, line in enumerate(lines):
        col = color1 if i == 0 else color2
        a = int(alpha * 255)
        bbox = draw.textbbox((0, 0), line, font=f)
        tw = bbox[2] - bbox[0]
        x = (W - tw) / 2
        draw.text((x, y + i * gap), line, fill=(*col, a), font=f)


def _draw_quiet(draw, text, alpha, color):
    f = font("InterDisplay-Medium.ttf", 46)
    a = int(alpha * 255)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    x = (W - tw) / 2
    draw.text((x, H * 0.43), text, fill=(*color, a), font=f)


def _draw_kinetic(draw, words, t, alpha):
    f = font("InterDisplay-Black.ttf", 68)
    y_center = H * 0.38
    gap = 90

    for i, word in enumerate(words):
        word_t = (t - i * 0.22) / 0.2
        word_alpha = ease_out_cubic(max(0, min(word_t, 1.0)))
        word_slide = (1 - word_alpha) * 35
        fade_out = ease_out_cubic(min((1 - t) / 0.12, 1.0))
        a = int(word_alpha * fade_out * alpha * 255)
        if a <= 0:
            continue

        bbox = draw.textbbox((0, 0), word, font=f)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        x = (W - tw) / 2
        y = y_center + i * gap + word_slide
        draw.text((x, y), word, fill=(*OFF_WHITE, a), font=f)

        # Amber accent underline
        if word_alpha > 0.5:
            la = int(min((word_alpha - 0.5) * 2, 1.0) * fade_out * alpha * 180)
            lw = int(tw * 0.4)
            lx = int(x + tw / 2 - lw / 2)
            ly = int(y + th + 10)
            draw.rectangle([lx, ly, lx + lw, ly + 3], fill=(*AMBER, la))


def _draw_keyword(draw, word, t, alpha, color):
    f = font("InterDisplay-Black.ttf", 56)
    wipe_t = ease_out_cubic(min(t / 0.2, 1.0))
    fade_out = ease_out_cubic(min((1 - t) / 0.15, 1.0))
    a = int(wipe_t * fade_out * alpha * 255)
    if a <= 0:
        return

    bbox = draw.textbbox((0, 0), word, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (W - tw) / 2
    y = H * 0.78

    # Dark background bar
    pad = 18
    bar_a = int(wipe_t * fade_out * alpha * 140)
    bar_w = int((tw + pad * 2) * wipe_t)
    bar_x = int(x - pad)
    bar_y = int(y - pad / 2)
    draw.rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + th + pad], fill=(22, 24, 28, bar_a))

    # Amber accent left bar
    accent_h = int((th + pad) * wipe_t)
    draw.rectangle([bar_x, bar_y, bar_x + 4, bar_y + accent_h],
                   fill=(*AMBER, int(wipe_t * fade_out * alpha * 230)))

    draw.text((x, y), word, fill=(*color, a), font=f)


def _draw_brand(draw, text, t, alpha):
    scale_t = ease_out_cubic(min(t / 0.3, 1.0))
    fade_out = ease_out_cubic(min((1 - t) / 0.1, 1.0))
    a = int(scale_t * fade_out * alpha * 255)
    if a <= 0:
        return

    f = font("InterDisplay-Black.ttf", 84)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (W - tw) / 2
    y = H * 0.42

    # Amber underline
    lw = int(tw * 0.5 * scale_t)
    lx = int(x + tw / 2 - lw / 2)
    ly = int(y + th + 18)
    draw.rectangle([lx, ly, lx + lw, ly + 4], fill=(*AMBER, int(a * 0.85)))

    draw.text((x, y), text, fill=(*OFF_WHITE, a), font=f)


def _draw_brand_tag(draw, text, t, alpha):
    fade_in = ease_out_cubic(min(t / 0.2, 1.0))
    fade_out = ease_out_cubic(min((1 - t) / 0.15, 1.0))
    a = int(fade_in * fade_out * alpha * 255)
    if a <= 0:
        return

    # Main tagline
    f = font("InterDisplay-Light.ttf", 40)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    x = (W - tw) / 2
    y = H * 0.52
    draw.text((x, y), text, fill=(*MUTED, a), font=f)

    # Sub taglines
    f2 = font("InterDisplay-Medium.ttf", 28)
    subs = ["Small enough to care.", "Technical enough to build."]
    for i, s in enumerate(subs):
        bbox2 = draw.textbbox((0, 0), s, font=f2)
        tw2 = bbox2[2] - bbox2[0]
        x2 = (W - tw2) / 2
        y2 = H * 0.58 + i * 42
        draw.text((x2, y2), s, fill=(*MUTED, int(a * 0.7)), font=f2)


def render_all_text():
    print("\n=== Rendering text overlays (v2) ===")
    for idx, (start, dur, kind, lines) in enumerate(TEXT_OVERLAYS):
        nf = render_text_overlay(idx, start, dur, kind, lines)
        print(f"  Text {idx:02d}: '{lines[0][:30]}' ({nf} frames)")


# ============================================================================
# STEP 3: Assemble final video (FIXED overlay compositing)
# ============================================================================
def assemble_video():
    print("\n=== Assembling final video (v2) ===")

    # Step 3a: Concatenate shot clips
    concat_list = os.path.join(CLIP_DIR, "concat.txt")
    with open(concat_list, "w") as f:
        for _, vid_start, _, _, _, _ in SHOTS:
            clip_path = os.path.join(CLIP_DIR, f"shot_{vid_start:.2f}.mp4")
            if os.path.exists(clip_path):
                f.write(f"file '{clip_path}'\n")

    base_video = os.path.join(OUT_DIR, "base_video_v2.mp4")
    print("  Concatenating clips...")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-t", "30", "-r", str(FPS), "-pix_fmt", "yuv420p",
        base_video,
    ], timeout=300)

    probe_r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", base_video],
        capture_output=True, text=True)
    print(f"  Base video: {probe_r.stdout.strip()}s")

    # Step 3b: Overlay text — FIXED approach
    # Convert each PNG sequence to a video, then use concat/overlay with CORRECT timing.
    # The key fix: use -itsoffset to position each overlay at its start time.
    print("  Building overlay composition...")

    # Build each text overlay video
    overlay_vids = []
    for idx, (start, dur, kind, lines) in enumerate(TEXT_OVERLAYS):
        overlay_dir = os.path.join(TEXT_DIR, f"text_{idx:02d}")
        pngs = sorted([f for f in os.listdir(overlay_dir) if f.endswith(".png")])
        if not pngs:
            continue

        text_vid = os.path.join(TEXT_DIR, f"overlay_{idx:02d}.mov")
        # Use prores_ks with alpha for lossless transparency
        run([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(overlay_dir, "%04d.png"),
            "-c:v", "qtrle",  # Animation codec preserves alpha perfectly
            "-pix_fmt", "argb",
            text_vid,
        ])
        if os.path.exists(text_vid) and os.path.getsize(text_vid) > 1000:
            overlay_vids.append((idx, start, dur, text_vid))
        else:
            print(f"    WARN: overlay {idx} failed to create")

    # Now build the composite in a single ffmpeg pass with -itsoffset
    # This is the CORRECT way: each overlay is offset to its timeline position
    inputs = ["-i", base_video]
    for idx, start, dur, path in overlay_vids:
        inputs.extend(["-itsoffset", str(start), "-i", path])

    # Build filter chain: chain overlays one by one
    filter_parts = []
    last_tag = "[0:v]"
    for i, (idx, start, dur, path) in enumerate(overlay_vids):
        inp_idx = i + 1
        out_tag = f"[v{i}]"
        end_t = start + dur
        # Use shortest=1 so overlay stops when the overlay video ends
        # eof_action=pass ensures base continues when overlay finishes
        filter_parts.append(
            f"{last_tag}[{inp_idx}:v]overlay=0:0:"
            f"enable='between(t,{start:.3f},{end_t:.3f})':"
            f"format=auto:eof_action=pass{out_tag}"
        )
        last_tag = out_tag

    filtergraph = ";".join(filter_parts)

    overlaid = os.path.join(OUT_DIR, "video_with_text_v2.mp4")
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filtergraph,
        "-map", last_tag,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-t", "30", "-r", str(FPS), "-pix_fmt", "yuv420p",
        overlaid,
    ]
    print(f"  Running overlay composition ({len(overlay_vids)} layers)...")
    success = run(cmd, timeout=600)

    if not success:
        print("  Trying simpler overlay approach...")
        # Fallback: apply overlays in sequential passes (slower but more reliable)
        current = base_video
        for i, (idx, start, dur, path) in enumerate(overlay_vids):
            end_t = start + dur
            next_vid = os.path.join(OUT_DIR, f"pass_{i:02d}.mp4")
            run([
                "ffmpeg", "-y",
                "-i", current,
                "-itsoffset", str(start),
                "-i", path,
                "-filter_complex",
                f"[0:v][1:v]overlay=0:0:enable='between(t,{start:.3f},{end_t:.3f})':format=auto:eof_action=pass",
                "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                "-t", "30", "-r", str(FPS), "-pix_fmt", "yuv420p",
                next_vid,
            ], timeout=300)
            if os.path.exists(next_vid) and os.path.getsize(next_vid) > 10000:
                if current != base_video:
                    os.remove(current)
                current = next_vid
                print(f"    Pass {i}/{len(overlay_vids)-1}: text_{idx:02d} OK")
            else:
                print(f"    Pass {i}: FAILED, skipping")
        overlaid = current

    # Step 3c: Add audio
    print("  Adding audio...")
    master_audio = os.path.join(OUT_DIR, "master_audio.wav")
    final = os.path.join(OUT_DIR, "lumen_labs_tiktok_30s_v2.mp4")

    run([
        "ffmpeg", "-y",
        "-i", overlaid,
        "-i", master_audio,
        "-c:v", "libx264", "-preset", "medium", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        "-t", "30", "-shortest",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        final,
    ])

    if os.path.exists(final):
        size = os.path.getsize(final)
        dur_r = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final],
            capture_output=True, text=True)
        print(f"\n{'='*55}")
        print(f"  FINAL: {final}")
        print(f"  Size:  {size//1024//1024}MB ({size//1024}KB)")
        print(f"  Duration: {dur_r.stdout.strip()}s")
        print(f"  Resolution: {W}x{H} (9:16 TikTok)")
        print(f"{'='*55}")
    else:
        print("ERROR: Final output not created!")


def main():
    prepare_clips()
    render_all_text()
    assemble_video()


if __name__ == "__main__":
    main()
