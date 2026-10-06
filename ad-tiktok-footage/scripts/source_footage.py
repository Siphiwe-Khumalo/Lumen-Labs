#!/usr/bin/env python3
"""
Source premium real-world footage from Coverr (free for commercial use, no attribution required).
Downloads 1080p clips matching the Lumen Labs ad brief: technology, business, infrastructure,
developers, software, networking, security, cloud, modern workplaces.
"""
import json
import os
import subprocess
import sys
import urllib.request
import urllib.parse

VIDEO_DIR = "/projects/sandbox/lumen-tiktok/assets/videos"
os.makedirs(VIDEO_DIR, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}


def api_search(query, page_size=20):
    url = f"https://coverr.co/api/videos?page_size={page_size}&query={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r).get("hits", [])
    except Exception as e:
        print(f"  ! search failed for '{query}': {e}")
        return []


def cdn_url(base_filename, quality="1080p"):
    return f"https://cdn.coverr.co/videos/{base_filename}/{quality}.mp4"


def download(url, dest):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
            data = r.read()
            f.write(data)
        return len(data)
    except Exception as e:
        print(f"  ! download failed: {e}")
        return 0


# What we want -> search terms. We'll pick the best-fitting horizontal clip per concept.
# Priority: real photography/footage of tech & business, NOT AI-generated.
WANTED = {
    "hook_city":        ["city aerial night", "city skyline", "drone city"],
    "code_screen":      ["coding screen", "code programming", "software code"],
    "developer":        ["developer typing", "programmer working", "laptop coding"],
    "server_room":      ["server room", "data center", "data server"],
    "network_cables":   ["network cables", "ethernet", "fiber optic"],
    "office_team":      ["office team meeting", "startup office", "office working"],
    "cyber_security":   ["cyber security", "digital security", "security lock"],
    "cctv_camera":      ["security camera", "cctv", "surveillance camera"],
    "mobile_phone":     ["smartphone screen", "mobile phone using", "phone app"],
    "cloud_tech":       ["cloud technology", "digital network", "data flow"],
    "circuit_board":    ["circuit board", "microchip", "motherboard"],
    "workspace_detail": ["keyboard typing", "mouse working desk", "hands laptop"],
    "business_city":    ["business district", "modern building", "glass building"],
    "data_viz":         ["data visualization", "digital data", "technology abstract"],
    "fingers_screen":   ["touchscreen", "tablet touch", "finger screen"],
    "router_tech":      ["router network", "wifi router", "networking device"],
}


def pick_best(hits):
    """Prefer horizontal, non-AI, higher resolution, decent duration."""
    scored = []
    for v in hits:
        if v.get("is_ai_generated"):
            continue
        if v.get("state") != "published":
            continue
        base = v.get("base_filename")
        if not base:
            continue
        score = 0
        if not v.get("is_vertical"):
            score += 5
        if v.get("max_height", 0) >= 1080:
            score += 3
        try:
            dur = float(v.get("duration", 0) or 0)
        except (TypeError, ValueError):
            dur = 0
        if 4 <= dur <= 30:
            score += 2
        score += min(v.get("downloads", 0), 50000) / 50000
        scored.append((score, v))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [v for _, v in scored]


def main():
    manifest = {}
    for name, queries in WANTED.items():
        got = False
        for q in queries:
            hits = api_search(q, page_size=25)
            ranked = pick_best(hits)
            for v in ranked:
                base = v["base_filename"]
                dest = os.path.join(VIDEO_DIR, f"{name}.mp4")
                if os.path.exists(dest) and os.path.getsize(dest) > 100000:
                    got = True
                    break
                size = download(cdn_url(base, "1080p"), dest)
                if size < 100000:
                    size = download(cdn_url(base, "720p"), dest)
                if size > 100000:
                    print(f"OK  {name:18s} <- '{q}' :: {v.get('title','')[:50]} ({size//1024}KB)")
                    manifest[name] = {
                        "title": v.get("title"),
                        "base_filename": base,
                        "query": q,
                        "duration": v.get("duration"),
                        "source": "coverr.co (free commercial use)",
                        "size_kb": size // 1024,
                    }
                    got = True
                    break
                else:
                    if os.path.exists(dest):
                        os.remove(dest)
            if got:
                break
        if not got:
            print(f"XX  {name:18s} -- no suitable clip found")

    with open(os.path.join(VIDEO_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nDownloaded {len(manifest)} clips.")


if __name__ == "__main__":
    main()
