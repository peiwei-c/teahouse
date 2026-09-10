#!/usr/bin/env python3
"""Create the tea-house loop and tile tap sounds."""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "audio"

SR = 22050
BPM = 64.0
BEAT = 60.0 / BPM
BARS = 8
RNG = np.random.default_rng(42)


def midi(n: float) -> float:
    return 440.0 * (2.0 ** ((n - 69.0) / 12.0))


def time_axis(dur: float) -> np.ndarray:
    n = max(1, int(round(dur * SR)))
    return np.arange(n, dtype=np.float64) / SR


def adsr(t: np.ndarray, a: float, d: float, s: float, r: float, hold: float) -> np.ndarray:
    attack_end = a
    decay_end = a + d
    sustain_end = max(decay_end, hold)
    env = np.zeros_like(t)
    attack = t < attack_end
    decay = (t >= attack_end) & (t < decay_end)
    sustain = (t >= decay_end) & (t < sustain_end)
    release = t >= sustain_end
    env[attack] = t[attack] / max(a, 1e-9)
    env[decay] = 1.0 - (1.0 - s) * ((t[decay] - attack_end) / max(d, 1e-9))
    env[sustain] = s
    env[release] = np.maximum(0.0, s * (1.0 - (t[release] - sustain_end) / max(r, 1e-9)))
    return env


def one_pole(x: np.ndarray, cutoff: float) -> np.ndarray:
    a = np.exp(-2.0 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    keep = 1.0 - a
    for i, sample in enumerate(x):
        acc = keep * sample + a * acc
        y[i] = acc
    return y


def highpass(x: np.ndarray) -> np.ndarray:
    y = np.empty_like(x)
    y[0] = x[0]
    y[1:] = x[1:] - x[:-1]
    return y


def add(buf: np.ndarray, start: float, sig: np.ndarray, gain: float = 1.0) -> None:
    i = int(round(start * SR))
    if i >= len(buf) or i + len(sig) <= 0:
        return
    a = max(0, i)
    b = min(len(buf), i + len(sig))
    sa = a - i
    sb = sa + (b - a)
    buf[a:b] += sig[sa:sb] * gain


def beat_time(bar: int, beat: float) -> float:
    return (bar * 4.0 + beat) * BEAT


def pad_tone(freq: float, dur: float, amp: float) -> np.ndarray:
    t = time_axis(dur)
    chorus = 1.0 + 0.012 * np.sin(2 * np.pi * 0.13 * t + freq * 0.01)
    a = np.sin(2 * np.pi * freq * chorus * t)
    b = 0.22 * np.sin(2 * np.pi * freq * 2.0 * t)
    env = adsr(t, 0.9, 0.6, 0.62, 1.4, dur - 1.4)
    return (a + b) * env * amp


def drone(freq: float, dur: float, amp: float) -> np.ndarray:
    t = time_axis(dur)
    phase = 2 * np.pi * freq * t
    body = np.sin(phase) + 0.12 * np.sin(2 * phase)
    env = adsr(t, 0.55, 0.4, 0.7, 1.6, dur - 1.6)
    return body * env * amp


def guzheng(freq: float, dur: float, amp: float) -> np.ndarray:
    t = time_axis(dur)
    glide = 1.0 + 0.035 * np.exp(-t * 22.0)
    f = freq * glide
    partials = (
        (1.0, 1.0, 1.35),
        (2.004, 0.28, 2.4),
        (3.02, 0.14, 3.3),
        (4.07, 0.07, 4.8),
        (5.5, 0.035, 7.2),
        (7.1, 0.018, 9.5),
    )
    sig = np.zeros_like(t)
    for ratio, level, decay in partials:
        sig += level * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * decay)
    nail = RNG.standard_normal(len(t)) * np.exp(-t * 70.0) * 0.045
    env = np.minimum(t / 0.004, 1.0)
    return (sig + nail) * env * amp


def xiao(freq: float, dur: float, amp: float) -> np.ndarray:
    t = time_axis(dur)
    vib = 1.0 + 0.009 * np.sin(2 * np.pi * 4.4 * t)
    breath = one_pole(RNG.standard_normal(len(t)), 1800) * np.exp(-t * 6.0) * 0.05
    tone = np.sin(2 * np.pi * freq * vib * t) + 0.16 * np.sin(2 * np.pi * freq * 2.0 * t)
    env = adsr(t, 0.18, 0.35, 0.58, 0.9, dur - 0.9)
    return (tone + breath) * env * amp


def chime(freq: float, dur: float, amp: float) -> np.ndarray:
    t = time_axis(dur)
    sig = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.8)
        + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 4.2)
        + 0.12 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 6.5)
    )
    env = np.minimum(t / 0.006, 1.0)
    return sig * env * amp


def room(n: int) -> np.ndarray:
    brown = np.cumsum(RNG.standard_normal(n))
    brown /= max(1e-9, np.max(np.abs(brown)))
    return one_pole(brown, 700) * 0.012


def write_wav(
    path: Path,
    left: np.ndarray,
    right: np.ndarray | None = None,
    peak_target: float = 0.89,
) -> None:
    if right is None:
        right = left
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-9)
    gain = peak_target / peak
    left = np.clip(left * gain, -1.0, 1.0)
    right = np.clip(right * gain, -1.0, 1.0)
    pcm = np.empty(left.size * 2, dtype=np.int16)
    pcm[0::2] = (left * 32767).astype(np.int16)
    pcm[1::2] = (right * 32767).astype(np.int16)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SR)
        wav.writeframes(pcm.tobytes())


def make_bgm() -> None:
    extra = 1.6
    total = BARS * 4 * BEAT + extra
    n = int(round(total * SR))
    left = np.zeros(n)
    right = np.zeros(n)

    # F Gong pentatonic beds: F G A C D. Open fifths, no jazz color.
    pads = [
        (0, [41, 48, 53, 57, 60]),  # F2 C3 F3 A3 C4
        (4, [38, 45, 50, 53, 57]),  # D2 A2 D3 F3 A3
        (6, [36, 43, 48, 50, 55]),  # C2 G2 C3 D3 G3
    ]
    for bar, notes in pads:
        start = beat_time(bar, 0)
        hold_bars = 4 if bar == 0 else 2
        dur = hold_bars * 4 * BEAT + 1.8
        for i, note in enumerate(notes):
            pan = -0.28 + 0.14 * i
            tone = pad_tone(midi(note), dur, 0.07 if i else 0.09)
            add(left, start, tone, 0.5 * (1 - pan))
            add(right, start, tone, 0.5 * (1 + pan))

    drones = [(0, 29, 4), (4, 26, 2), (6, 24, 2)]  # F1, D1, C1
    for bar, note, bars in drones:
        tone = drone(midi(note), bars * 4 * BEAT + 1.8, 0.16)
        add(left, beat_time(bar, 0), tone, 0.5)
        add(right, beat_time(bar, 0), tone, 0.5)

    # Sparse guzheng, all F pentatonic.
    plucked = [
        (0, 2.0, 69, 2.4),
        (1, 1.0, 72, 2.0),
        (2, 3.0, 67, 1.8),
        (3, 2.0, 65, 2.2),
        (4, 1.5, 69, 2.0),
        (5, 3.0, 65, 1.6),
        (6, 2.0, 67, 2.2),
        (7, 1.0, 72, 2.8),
    ]
    for bar, beat, note, dur_beats in plucked:
        tone = guzheng(midi(note), dur_beats * BEAT, 0.32)
        start = beat_time(bar, beat)
        add(left, start, tone, 0.38)
        add(right, start + 0.018, tone, 0.62)

    answers = [
        (1, 3.0, 60, 1.6),
        (3, 0.5, 65, 1.4),
        (5, 1.0, 62, 1.5),
        (7, 3.0, 60, 1.8),
    ]
    for bar, beat, note, dur_beats in answers:
        tone = guzheng(midi(note), dur_beats * BEAT, 0.16)
        start = beat_time(bar, beat)
        add(left, start + 0.02, tone, 0.62)
        add(right, start, tone, 0.38)

    flute = [
        (0, 0.0, 77, 3.2),
        (4, 0.0, 74, 2.8),
        (6, 2.0, 72, 3.4),
    ]
    for bar, beat, note, dur_beats in flute:
        tone = xiao(midi(note), dur_beats * BEAT, 0.11)
        start = beat_time(bar, beat)
        add(left, start, tone, 0.58)
        add(right, start, tone, 0.42)

    bells = [(2, 0.0, 84, 2.4), (6, 0.0, 81, 2.8)]
    for bar, beat, note, dur_beats in bells:
        tone = chime(midi(note), dur_beats * BEAT, 0.07)
        start = beat_time(bar, beat)
        add(left, start, tone, 0.45)
        add(right, start + 0.03, tone, 0.55)

    air = room(n)
    mix_l = one_pole(left, 7600) + air
    mix_r = one_pole(right, 7600) + air * 0.92

    loop_n = int(round(BARS * 4 * BEAT * SR))
    fade = int(1.2 * SR)
    fade = min(fade, loop_n // 4)
    t = np.linspace(0.0, 1.0, fade)
    mix_l[:fade] = mix_l[:fade] * t + mix_l[loop_n : loop_n + fade] * (1.0 - t)
    mix_r[:fade] = mix_r[:fade] * t + mix_r[loop_n : loop_n + fade] * (1.0 - t)
    write_wav(OUT / "lofi-bgm.wav", mix_l[:loop_n], mix_r[:loop_n], peak_target=0.68)


def ceramic_tap() -> tuple[np.ndarray, np.ndarray]:
    t = time_axis(0.22)
    click = highpass(RNG.standard_normal(len(t))) * np.exp(-t * 140) * 0.18
    cup = (
        np.sin(2 * np.pi * 980 * t) * np.exp(-t * 18)
        + 0.45 * np.sin(2 * np.pi * 1960 * t) * np.exp(-t * 22)
        + 0.18 * np.sin(2 * np.pi * 2920 * t) * np.exp(-t * 28)
    )
    wood = np.sin(2 * np.pi * 320 * t) * np.exp(-t * 26) * 0.35
    body = (click + 0.7 * cup + wood) * np.minimum(t / 0.0015, 1.0)
    left = one_pole(body * 0.9, 9000)
    right = one_pole(body * 0.85, 9000)
    return left, right


def tucked_thud() -> tuple[np.ndarray, np.ndarray]:
    t = time_axis(0.28)
    freq = 168 * np.exp(-t * 14) + 72
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    mute = np.sin(2 * np.pi * 214 * t) * np.exp(-t * 20) * 0.25
    dust = highpass(RNG.standard_normal(len(t))) * np.exp(-t * 40) * 0.08
    env = np.minimum(t / 0.003, 1.0) * np.exp(-t * 11)
    sig = one_pole((body + mute + dust) * env, 1400)
    return sig * 0.95, sig * 0.9


def make_sfx() -> None:
    write_wav(OUT / "tile-select.wav", *ceramic_tap(), peak_target=0.78)
    write_wav(OUT / "tile-blocked.wav", *tucked_thud(), peak_target=0.58)


if __name__ == "__main__":
    make_bgm()
    make_sfx()
    print("wrote", OUT)
