# Lumen Labs — 30s TikTok Ad (real-footage cut)

A **footage-driven** 30-second TikTok advertisement for Lumen Labs. 9:16 vertical
(1080×1920 @30fps), assembled with **ffmpeg** over real licensed stock footage,
a neural voice-over, and a synthesized cinematic underscore.

This is an **isolated subproject** — it has its own scripts and output and never
touches the website root or the Remotion `ad/` subproject. It is deliberately a
*different* production approach from the code-driven Remotion films in `ad/`:
real-world photography and video (not motion-graphics), cut for the scroll-stopping,
energetic feel of a native TikTok ad.

> Positioning (per brief): modern, confident, energetic, premium — NOT a shortened
> version of the cinematic 90s brand film. Real photography/footage over anything
> AI-generated. Voice-over is the primary audio element and always sits above the
> music.

---

## Deliverable

**`out/lumen-labs-tiktok-footage-30s.mp4`**

| Spec | Value |
|------|-------|
| Duration | 30.000s |
| Resolution | 1080 × 1920 (9:16 vertical) |
| Codec | H.264 / AAC |
| Frame rate | 30 fps |
| Audio | Stereo, 44.1 kHz, 192 kbps AAC |
| Size | ~20 MB |

Proof still (full timeline, one frame per beat): `out/timeline-proof.jpg`.

---

## Story structure

| Time | Beat | Visual | On-screen text |
|------|------|--------|----------------|
| 0:00–0:03.6 | **Hook** | City aerial (night) → data/trading screen | "Your business doesn't need more technology." |
| 0:03.6–0:05.6 | Hook payoff | Code + developer reflection | "It needs the RIGHT technology." |
| 0:05.6–0:12.4 | **Problem** | Typing · editing timeline · phone · whiteboard | "Everything runs on tech." / "apps. systems. screens." |
| 0:12.4–0:14.2 | Problem close | Data overload (phone + laptop) | "It gets complicated." |
| 0:14.2–0:16.3 | **Solution** intro | Developer at desk | "That's where we come in." |
| 0:16.3–0:27 | Solution | code · editing · router ports · cable · secure txn · smart-home · ports | **SOFTWARE · WEB APPS · CLOUD·INFRA · NETWORKING · SECURITY·CCTV · VoIP·IoT · ALL OF IT** |
| 0:27–0:28.7 | **Brand** | City aerial (dark, graded) | **LUMEN LABS** |
| 0:28.7–0:30 | Final | City aerial | "Built with intention." / "Small enough to care. Technical enough to build." |

~16 shots in 30s (≈1.7s each) — fast but readable; the brand moment slows to breathe.

---

## Visual identity

- **Palette:** graphite / dark backgrounds, warm amber accents
- **Typography:** Inter Display (Black / Bold / SemiBold / Medium / Light)
- **Grade:** per-shot treatment (dark_push · warm · cool · hero · amber · brand_dark)
- **Footage:** real-world photography/video — no AI people, no fake offices, no cyberpunk

## Audio

- **Voice-over** (primary element): Microsoft Edge neural TTS, *Andrew* voice —
  warm, confident, conversational. Script in `scripts/vo_script.txt`.
- **Music:** original synthesized cinematic underscore that builds momentum.
- **Mix:** VO-priority ducking — the music drops ≈10 dB under narration, so every
  word stays intelligible on a phone speaker. Measured: VO segments ≈ −28 dB vs
  music-only gaps ≈ −39 dB.

---

## Reproducing the media (after a fresh checkout)

The heavy, regenerable media (source footage, VO/music WAVs, intermediate clips)
is **git-ignored** — the repo keeps the final MP4, the timeline proof still, and
the scripts. Requires `ffmpeg`, Python 3.9+, and `pip install Pillow numpy edge-tts`.

The scripts expect a working directory `lumen-tiktok/` with
`assets/{videos,audio,fonts}` and `output/`. From that root:

```sh
python3 scripts/source_footage.py   # footage → assets/videos/ (Coverr, free commercial)
python3 scripts/generate_audio.py   # music + SFX → assets/audio/
python3 scripts/mix_audio.py        # VO + underscore → output/master_audio.wav
python3 scripts/build_video_v2.py   # final cut → output/lumen_labs_tiktok_30s_v2.mp4
```

Fonts: Inter (SIL Open Font License) — download the family into `assets/fonts/`
(see the weight list referenced in `build_video_v2.py`).

---

## Licensing / provenance

| Asset | Source | License |
|-------|--------|---------|
| Footage | [Coverr](https://coverr.co) | Coverr License — free commercial, no attribution |
| Fonts | Inter | SIL Open Font License |
| Music / SFX | original (synthesized in `generate_audio.py`) | no restriction |
| Voice-over | Microsoft Edge TTS (Azure neural) | free tier |

Content from external sources was used per each source's license.

---

## Voice-over script

> "Your business doesn't need more technology."
> "It needs the right technology."
>
> "Everything runs on tech now."
> "But somewhere between the apps, the systems, the screens…"
> "it all gets complicated."
>
> "That's where we come in."
> "Lumen Labs builds the software, the systems, the infrastructure…"
> "the websites, the networks, the security…"
> "everything your business actually runs on."
>
> "Built with intention."
