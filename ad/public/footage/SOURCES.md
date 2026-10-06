# Footage sources — Lumen Labs cinematic brand film

All clips are **Mixkit** 1080p MP4 under the **Mixkit Free License — commercial use, no attribution**.
License: <https://mixkit.co/license/>

URL pattern: `https://assets.mixkit.co/videos/<id>/<id>-1080.mp4`

Regenerate with `scripts/fetch-footage.sh`. Durations are probed at
fetch time (frames @30fps) and consumed by `src/config/footage.ts`.

## Clips used in the cut

| id | local file | Mixkit title | used in | durationInFrames @30 |
|---|---|---|---|---|
| 8739 | `struggle-worried.mp4` | Worried and sad woman, outdoors | film01 1.1 (HERO) | 450 |
| 1781 | `quiet-desk-dawn.mp4` | Working on a laptop (quiet lone desk) | film01 1.2 (HERO, swapped in for 914) | 360 |
| 221 | `office-glasses-reflection.mp4` | Reflection of a screen in glasses | film02 2.1 | 603 |
| 308 | `laptop-work.mp4` | Man working on his laptop | film02 2.2 | 639 |
| 918 | `office-busy.mp4` | Busy office space | film02b 2b.1 | 355 |
| 4840 | `rooftop-sunset.mp4` | Woman during a sunset on a rooftop | film02b 2b.2 (HERO) | 460 |
| 4809 | `meeting-collab.mp4` | Business people at work meeting | film03 3.1 | 1122 |
| 30012 | `handshake.mp4` | Pair of hands shaking hands | film03 3.2 | 222 |
| 29991 | `engineer-workshop.mp4` | Young engineer programming in his workshop | film03 3.3 | 451 |
| 1728 | `dev-code.mp4` | Software developer working on code, screen close up | film05 5.1 | 550 |
| 1735 | `dev-topview.mp4` | A developer typing on a laptop, top view | film05 5.2 | 450 |
| 41642 | `multiscreen.mp4` | Professional programmer working on a big computer | film06 6.1 | 247 |
| 49878 | `city-aerial-night.mp4` | Big city at night from an aerial shot | film06 6.2 | 428 |
| 41637 | `ops-twoscreen.mp4` | Programmer working with codes on a computer | film07 7.1 | 307 |
| 4831 | `park-sunrise.mp4` | View of a park while a girl runs across | film08 8.1 | 247 |

## Reserves (removed from the shipped set)

The following reserve clips were downloaded during asset acquisition (FEAT-002)
to allow a content-verification swap without a re-fetch, but **none was used in
the final cut**, so they were removed before the final commit to keep the asset
footprint reasonable. Re-fetch any of them with `scripts/fetch-footage.sh` if a
future swap is needed.

| id | former local file | note |
|---|---|---|
| 1808 | `reserve-1808-close-typing.mp4` | close typing |
| 41640 | `reserve-41640-hands-programming.mp4` | hands programming |
| 41654 | `reserve-41654-code-on-screen.mp4` | code on screen |
| 1781 | `reserve-1781-laptop-close.mp4` | laptop close (its content is the clip that WAS swapped in as `quiet-desk-dawn.mp4`, which still ships) |
| 242 | `reserve-242-typing-laptop.mp4` | typing on a laptop |
| 4915 | `reserve-4915-hands-phone.mp4` | hands typing on a phone |
| 49845 | `reserve-49845-aerial-city.mp4` | aerial city variant |
| 49846 | `reserve-49846-aerial-city.mp4` | aerial city variant |

## Content-verification swaps (FEAT-002 gate)

- **film01 1.2 — id 914 ("Open office space") SWAPPED OUT → id 1781
  (`quiet-desk-dawn.mp4`).** The 914 footage is a *busy, fully populated*
  open-plan office across its whole runtime (eyeballed at t=0.2s/5s/10s/18s),
  which contradicts the storyboard's "open office before anyone arrives /
  empty desks, cold light; the realities waiting" beat. 1781 is a quiet,
  lone-desk laptop macro that reads cold/isolated for that hero beat and does
  not duplicate the wider 308 "man working on his laptop" shot. 914 was
  removed from the committed set (not a listed reserve).
- The other three hero clips — 8739 (worried owner), 4840 (low-point
  silhouette), 4831 (warm resolution) — were eyeballed and KEPT as-is.

> No AI-generated / synthetic footage is used. Mixkit id 99786
> ("Animation of futuristic devices") was deliberately rejected as too
> close to the forbidden "generic futuristic tech imagery".
