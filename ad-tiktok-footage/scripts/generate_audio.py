#!/usr/bin/env python3
"""
Generate the audio track for the Lumen Labs TikTok ad.
Produces:
  - A synthesized cinematic music underscore (modern, building momentum)
  - Sound design elements (subtle tech clicks, transitions, impacts)
  - TTS voiceover placeholder (markers for manual voiceover)
  
The music must stay UNDERNEATH the voiceover at all times.
"""
import struct
import math
import os
import subprocess
import random
import numpy as np

OUTPUT_DIR = "/projects/sandbox/lumen-tiktok/assets/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 44100
DURATION = 31.0  # 31 seconds total (slight pad)
NUM_SAMPLES = int(SAMPLE_RATE * DURATION)


def write_wav(filename, samples, sample_rate=44100):
    """Write a mono float array to a 16-bit WAV file."""
    samples = np.clip(samples, -1.0, 1.0)
    int_samples = (samples * 32767).astype(np.int16)
    with open(filename, "wb") as f:
        data = int_samples.tobytes()
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + len(data)))
        f.write(b"WAVE")
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))
        f.write(struct.pack("<H", 1))  # PCM
        f.write(struct.pack("<H", 1))  # mono
        f.write(struct.pack("<I", sample_rate))
        f.write(struct.pack("<I", sample_rate * 2))
        f.write(struct.pack("<H", 2))
        f.write(struct.pack("<H", 16))
        f.write(b"data")
        f.write(struct.pack("<I", len(data)))
        f.write(data)


def sine(freq, t, phase=0):
    return np.sin(2 * np.pi * freq * t + phase)


def saw(freq, t, harmonics=6):
    out = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        out += (-1) ** (k + 1) * (2.0 / (k * np.pi)) * np.sin(2 * np.pi * k * freq * t)
    return out


def lowpass(sig, cutoff_ratio=0.1):
    """Simple rolling average lowpass."""
    kernel_size = max(1, int(1 / cutoff_ratio))
    kernel = np.ones(kernel_size) / kernel_size
    return np.convolve(sig, kernel, mode="same")


def envelope(t, attack=0.01, hold=0, decay=0.5, sustain=0.3, release=0.5, total_dur=1.0):
    env = np.zeros_like(t)
    for i, tv in enumerate(t):
        if tv < attack:
            env[i] = tv / attack
        elif tv < attack + hold:
            env[i] = 1.0
        elif tv < attack + hold + decay:
            env[i] = 1.0 - (1.0 - sustain) * (tv - attack - hold) / decay
        elif tv < total_dur - release:
            env[i] = sustain
        elif tv < total_dur:
            env[i] = sustain * (1.0 - (tv - (total_dur - release)) / release)
    return np.clip(env, 0, 1)


def generate_music():
    """Create a modern cinematic tech underscore that builds momentum."""
    t = np.linspace(0, DURATION, NUM_SAMPLES, endpoint=False)
    out = np.zeros(NUM_SAMPLES)
    
    # === BASS: Deep sub bass (root note progression) ===
    # Key: E minor -> G major -> C major -> B minor -> E minor
    # Progression timed to story beats
    bass_notes = [
        (0.0, 3.0,  82.41),   # E2 - hook
        (3.0, 6.0,  73.42),   # D2 - problem intro
        (6.0, 10.0, 65.41),   # C2 - problem deepens
        (10.0, 14.0, 82.41),  # E2 - solution begins
        (14.0, 18.0, 98.00),  # G2 - building
        (18.0, 23.0, 110.00), # A2 - climax build
        (23.0, 27.0, 82.41),  # E2 - brand moment
        (27.0, 31.0, 82.41),  # E2 - final
    ]
    
    for start, end, freq in bass_notes:
        mask = (t >= start) & (t < end)
        dur = end - start
        local_t = t[mask] - start
        local_env = envelope(local_t, attack=0.05, decay=0.2, sustain=0.7, release=0.3, total_dur=dur)
        # Warm sub bass with slight harmonics
        bass = sine(freq, local_t) * 0.6 + sine(freq * 2, local_t) * 0.15 + sine(freq * 0.5, local_t) * 0.25
        bass = lowpass(bass, 0.02)
        out[mask] += bass * local_env * 0.35
    
    # === PADS: Atmospheric synth pads ===
    pad_chords = [
        (0.0,  3.0,  [329.63, 392.00, 493.88]),        # Em chord
        (3.0,  6.0,  [293.66, 349.23, 440.00]),        # Dm
        (6.0,  10.0, [261.63, 329.63, 392.00]),        # C
        (10.0, 14.0, [329.63, 392.00, 493.88]),        # Em  
        (14.0, 18.0, [392.00, 493.88, 587.33]),        # G
        (18.0, 23.0, [440.00, 523.25, 659.25]),        # Am
        (23.0, 27.0, [329.63, 415.30, 493.88]),        # E(maj)
        (27.0, 31.0, [329.63, 415.30, 493.88]),        # E(maj)
    ]
    
    for start, end, freqs in pad_chords:
        mask = (t >= start) & (t < end)
        dur = end - start
        local_t = t[mask] - start
        local_env = envelope(local_t, attack=0.8, decay=0.3, sustain=0.5, release=1.0, total_dur=dur)
        pad = np.zeros(np.sum(mask))
        for freq in freqs:
            pad += sine(freq, local_t) * 0.3 + sine(freq * 2, local_t) * 0.08
        pad = lowpass(pad, 0.005)
        # Build intensity over time
        time_factor = np.clip((start + local_t) / 23.0, 0.3, 1.0)
        out[mask] += pad * local_env * 0.12 * time_factor
    
    # === RHYTHMIC PULSE: Subtle sidechained pulse ===
    # Creates the "driving" feel of a tech commercial
    bpm = 120
    beat_dur = 60.0 / bpm
    pulse_freq = 130.81  # C3
    
    for beat_start in np.arange(3.0, 27.0, beat_dur):
        if beat_start >= DURATION:
            break
        mask = (t >= beat_start) & (t < beat_start + beat_dur * 0.8)
        if np.sum(mask) == 0:
            continue
        local_t = t[mask] - beat_start
        local_env = np.exp(-local_t * 8)  # Quick decay
        pulse = sine(pulse_freq, local_t) * 0.3
        pulse = lowpass(pulse, 0.03)
        intensity = np.clip((beat_start - 3.0) / 20.0, 0.0, 0.6) * 0.15
        out[mask] += pulse * local_env * intensity
    
    # === HI-HAT PATTERN: Very subtle digital ticks ===
    for beat_start in np.arange(6.0, 27.0, beat_dur / 2):
        if beat_start >= DURATION:
            break
        mask = (t >= beat_start) & (t < beat_start + 0.03)
        if np.sum(mask) == 0:
            continue
        local_t = t[mask] - beat_start
        noise = np.random.uniform(-1, 1, np.sum(mask))
        noise_env = np.exp(-local_t * 200)
        intensity = np.clip((beat_start - 6.0) / 17.0, 0.0, 0.5) * 0.08
        out[mask] += noise * noise_env * intensity
    
    # === IMPACT at key moments ===
    impact_times = [0.0, 3.0, 10.0, 23.0, 27.0]
    for imp_t in impact_times:
        mask = (t >= imp_t) & (t < imp_t + 0.5)
        if np.sum(mask) == 0:
            continue
        local_t = t[mask] - imp_t
        impact = sine(40, local_t) * np.exp(-local_t * 6) * 0.4
        noise_burst = np.random.uniform(-1, 1, np.sum(mask)) * np.exp(-local_t * 20) * 0.15
        out[mask] += impact + noise_burst
    
    # === RISING TENSION (10-23s) ===
    mask = (t >= 10.0) & (t < 23.0)
    local_t = t[mask] - 10.0
    rise_freq = 200 + local_t * 40  # Rising frequency
    rise = sine(rise_freq, local_t) * 0.03 * (local_t / 13.0)
    out[mask] += lowpass(rise, 0.01)
    
    # === VOLUME ENVELOPE: Start subtle, build, slight dip at brand moment, resolve ===
    vol_env = np.ones(NUM_SAMPLES)
    # Gentle start
    mask_start = t < 2.0
    vol_env[mask_start] = t[mask_start] / 2.0
    # Build from 3-23s
    mask_build = (t >= 3.0) & (t < 23.0)
    vol_env[mask_build] = 0.5 + 0.5 * ((t[mask_build] - 3.0) / 20.0)
    # Brand moment dip
    mask_brand = (t >= 23.0) & (t < 25.0)
    vol_env[mask_brand] = 0.7
    # Final resolve
    mask_final = (t >= 25.0) & (t < 30.0)
    vol_env[mask_final] = 0.8
    # Fade out
    mask_out = t >= 29.0
    vol_env[mask_out] = 0.8 * np.clip((31.0 - t[mask_out]) / 2.0, 0, 1)
    
    out *= vol_env
    
    # Normalize
    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak * 0.85
    
    return out


def generate_sfx():
    """Generate sound design elements: clicks, whooshes, digital transitions."""
    t = np.linspace(0, DURATION, NUM_SAMPLES, endpoint=False)
    out = np.zeros(NUM_SAMPLES)
    
    # Whoosh transitions at key edit points
    whoosh_times = [2.8, 9.8, 22.8, 26.8]
    for w_t in whoosh_times:
        mask = (t >= w_t) & (t < w_t + 0.4)
        if np.sum(mask) == 0:
            continue
        local_t = t[mask] - w_t
        noise = np.random.uniform(-1, 1, np.sum(mask))
        # Frequency sweep
        sweep_env = np.exp(-((local_t - 0.15) ** 2) / 0.01)
        out[mask] += noise * sweep_env * 0.15
    
    # Digital click sounds at shot transitions
    click_times = [1.0, 2.0, 4.0, 5.5, 7.0, 8.5, 11.0, 12.5, 14.0, 15.5, 17.0, 18.5, 20.0, 21.5]
    for c_t in click_times:
        mask = (t >= c_t) & (t < c_t + 0.02)
        if np.sum(mask) == 0:
            continue
        local_t = t[mask] - c_t
        click = sine(4000, local_t) * np.exp(-local_t * 300) * 0.08
        out[mask] += click
    
    # Subtle interface beep at "Lumen Labs" reveal
    mask = (t >= 23.0) & (t < 23.3)
    if np.sum(mask) > 0:
        local_t = t[mask] - 23.0
        beep = sine(880, local_t) * np.exp(-local_t * 10) * 0.1
        beep += sine(1320, local_t) * np.exp(-local_t * 12) * 0.05
        out[mask] += beep
    
    return out


def main():
    print("Generating music underscore...")
    music = generate_music()
    write_wav(os.path.join(OUTPUT_DIR, "music.wav"), music, SAMPLE_RATE)
    
    print("Generating sound design...")
    sfx = generate_sfx()
    write_wav(os.path.join(OUTPUT_DIR, "sfx.wav"), sfx, SAMPLE_RATE)
    
    # Mix music + sfx (music at 60%, sfx at 40%)
    mixed = music * 0.6 + sfx * 0.4
    peak = np.max(np.abs(mixed))
    if peak > 0:
        mixed = mixed / peak * 0.85
    write_wav(os.path.join(OUTPUT_DIR, "underscore.wav"), mixed, SAMPLE_RATE)
    
    print("Audio generated successfully.")
    print(f"  music.wav:      {os.path.getsize(os.path.join(OUTPUT_DIR, 'music.wav'))//1024}KB")
    print(f"  sfx.wav:        {os.path.getsize(os.path.join(OUTPUT_DIR, 'sfx.wav'))//1024}KB")
    print(f"  underscore.wav: {os.path.getsize(os.path.join(OUTPUT_DIR, 'underscore.wav'))//1024}KB")


if __name__ == "__main__":
    main()
