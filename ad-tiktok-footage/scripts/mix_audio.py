#!/usr/bin/env python3
"""
Build the final master audio for the Lumen Labs TikTok ad.
Places each VO segment at its timeline position, ducks the music under VO,
and produces a single 30s stereo audio file.
"""
import os
import struct
import subprocess
import numpy as np

AUDIO_DIR = "/projects/sandbox/lumen-tiktok/assets/audio"
OUT = "/projects/sandbox/lumen-tiktok/output/master_audio.wav"
SR = 44100
TOTAL_DUR = 30.5  # slight pad
NUM_SAMPLES = int(SR * TOTAL_DUR)

# VO timeline from timeline.py
VO_TIMELINE = [
    ("vo_01_hook1.mp3",     0.40),
    ("vo_02_hook2.mp3",     3.45),
    ("vo_03_problem1.mp3",  5.80),
    ("vo_04_problem2.mp3",  7.85),
    ("vo_05_problem3.mp3",  12.10),
    ("vo_06_solution1.mp3", 14.20),
    ("vo_07_solution2.mp3", 16.20),
    ("vo_08_solution3.mp3", 21.00),
    ("vo_09_solution4.mp3", 24.35),
    ("vo_11_tagline.mp3",   28.00),
]


def load_wav_pcm(path):
    """Load a WAV file as float32 mono array."""
    with open(path, "rb") as f:
        data = f.read()
    # Find data chunk
    idx = data.find(b"data")
    if idx < 0:
        return np.zeros(0)
    size = struct.unpack("<I", data[idx+4:idx+8])[0]
    raw = data[idx+8:idx+8+size]
    samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32767
    return samples


def load_mp3_as_float(path, target_sr=44100):
    """Convert MP3 to WAV via ffmpeg and load."""
    tmp = path + ".tmp.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", path, "-ar", str(target_sr), "-ac", "1", "-f", "wav", tmp
    ], capture_output=True)
    samples = load_wav_pcm(tmp)
    os.remove(tmp)
    return samples


def write_stereo_wav(path, left, right, sr=44100):
    """Write stereo 16-bit WAV."""
    left = np.clip(left, -1, 1)
    right = np.clip(right, -1, 1)
    interleaved = np.empty(len(left) * 2, dtype=np.int16)
    interleaved[0::2] = (left * 32767).astype(np.int16)
    interleaved[1::2] = (right * 32767).astype(np.int16)
    data = interleaved.tobytes()
    with open(path, "wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + len(data)))
        f.write(b"WAVE")
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))
        f.write(struct.pack("<H", 1))
        f.write(struct.pack("<H", 2))  # stereo
        f.write(struct.pack("<I", sr))
        f.write(struct.pack("<I", sr * 4))
        f.write(struct.pack("<H", 4))
        f.write(struct.pack("<H", 16))
        f.write(b"data")
        f.write(struct.pack("<I", len(data)))
        f.write(data)


def main():
    print("Loading underscore...")
    underscore = load_wav_pcm(os.path.join(AUDIO_DIR, "underscore.wav"))
    if len(underscore) < NUM_SAMPLES:
        underscore = np.pad(underscore, (0, NUM_SAMPLES - len(underscore)))
    else:
        underscore = underscore[:NUM_SAMPLES]

    # Build VO composite
    print("Placing VO segments...")
    vo_mix = np.zeros(NUM_SAMPLES)
    vo_envelope = np.zeros(NUM_SAMPLES)  # for ducking

    for filename, start_time in VO_TIMELINE:
        path = os.path.join(AUDIO_DIR, filename)
        if not os.path.exists(path):
            print(f"  SKIP (missing): {filename}")
            continue
        samples = load_mp3_as_float(path, SR)
        start_idx = int(start_time * SR)
        end_idx = min(start_idx + len(samples), NUM_SAMPLES)
        seg_len = end_idx - start_idx
        if seg_len <= 0:
            continue
        vo_mix[start_idx:end_idx] += samples[:seg_len]
        # Build envelope for ducking (slightly wider than actual VO)
        duck_pad = int(0.15 * SR)  # 150ms pre/post
        duck_start = max(0, start_idx - duck_pad)
        duck_end = min(NUM_SAMPLES, end_idx + duck_pad)
        vo_envelope[duck_start:duck_end] = 1.0
        print(f"  OK: {filename} at {start_time:.2f}s ({seg_len/SR:.2f}s)")

    # Smooth the ducking envelope
    kernel = np.ones(int(0.05 * SR)) / int(0.05 * SR)
    vo_envelope = np.convolve(vo_envelope, kernel, mode="same")
    vo_envelope = np.clip(vo_envelope, 0, 1)

    # Duck the underscore: when VO is present, reduce music to 25% volume
    music_level = 0.30  # base music level (keeps it under VO)
    ducked_music = underscore * (music_level - vo_envelope * 0.20)  # drops to 10% under VO

    # VO is the primary element — boost it slightly and ensure clarity
    vo_level = 0.85
    master = ducked_music + vo_mix * vo_level

    # Soft limiting
    peak = np.max(np.abs(master))
    if peak > 0.95:
        master = master * (0.95 / peak)

    # Create stereo (slight stereo widening on music, VO centered)
    print("Creating stereo mix...")
    left = ducked_music * 0.52 + vo_mix * vo_level * 0.5
    right = ducked_music * 0.48 + vo_mix * vo_level * 0.5

    # Normalize stereo
    stereo_peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
    if stereo_peak > 0.95:
        left *= 0.95 / stereo_peak
        right *= 0.95 / stereo_peak

    # Trim to exactly 30s
    final_samples = int(30.0 * SR)
    left = left[:final_samples]
    right = right[:final_samples]

    # Write
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    write_stereo_wav(OUT, left, right, SR)
    print(f"\nMaster audio: {OUT}")
    print(f"  Duration: {len(left)/SR:.2f}s")
    print(f"  Size: {os.path.getsize(OUT)//1024}KB")


if __name__ == "__main__":
    main()
