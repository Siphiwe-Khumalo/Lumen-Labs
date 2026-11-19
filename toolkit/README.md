# Lumen Labs Toolkit

Everything for design, web dev, media and automation in one folder: an installer for your machine, editor extensions, automation scripts, and a map of the AI plugins and connected apps Claude can use.

## Quick start (on your computer)

```bash
bash toolkit/install.sh              # install everything (macOS or Ubuntu/WSL)
bash toolkit/install.sh design web   # or just some groups
bash toolkit/scripts/doctor.sh       # check what's installed
```

Running it again is safe. Anything already installed is skipped.

## What gets installed

| Group    | Tools                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `core`   | git, GitHub CLI, Node LTS (via fnm), pnpm, Python, pipx, jq, ripgrep, fzf                                                  |
| `web`    | TypeScript, Vite, Prettier, ESLint, Playwright, Lighthouse, Vercel / Netlify / Cloudflare (wrangler) CLIs, Docker          |
| `design` | Figma, Inkscape, GIMP, Krita, Blender, ImageMagick, librsvg, WebP, potrace, exiftool, SVGO, sharp-cli, Squoosh, fonttools  |
| `media`  | ffmpeg, yt-dlp, OBS, HandBrake, DaVinci Resolve (macOS), Remotion                                                          |
| `ai`     | Claude Code CLI, Anthropic SDK (Node + Python)                                                                             |
| `editor` | VS Code plus every extension in [`editor/extensions.txt`](editor/extensions.txt) (also installs into Cursor if it's there) |

Paid apps (Adobe Creative Cloud, Figma paid seats, DaVinci Studio) still need your own licence and login.

## Automation scripts

| Script                                                        | What it does                                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `scripts/images.sh web <in> <out> [width]`                    | Batch-resize a folder of photos to web-ready JPG + WebP + AVIF and strip metadata |
| `scripts/images.sh social <img> <out>`                        | One image → square, portrait, story, Open Graph and banner crops                  |
| `scripts/images.sh favicon <img> <out>`                       | Full favicon set: `.ico`, 16–512 PNGs, Apple touch icon                           |
| `scripts/images.sh strip <dir>`                               | Remove EXIF / GPS data before publishing                                          |
| `scripts/video.sh web <in.mp4> <out>`                         | Hero-background video: MP4 + WebM + poster frame                                  |
| `scripts/video.sh vertical <in> <out>`                        | 16:9 → 9:16 for TikTok / Reels / Shorts                                           |
| `scripts/video.sh gif <in> <out> [width]`                     | High-quality GIF                                                                  |
| `scripts/video.sh frames <in> <out> [fps]`                    | Export frames for storyboards                                                     |
| `scripts/new-project.sh <name> [react\|vanilla\|astro\|next]` | Scaffold a new project on the same stack as this site                             |

## Claude's plugins and skills (already installed in your Claude account)

Ask for any of these in plain words and Claude picks the right one.

- **Design:** design critique, design system, accessibility review, UX copy, design handoff, user-research synthesis, consistent UI, canvas design, image generation
- **Canva:** create, edit and resize designs, bulk-create from a spreadsheet, brand check, apply reviewer feedback
- **Adobe for creativity:** batch photo edits, portrait retouching, social variations, resize photos and videos, quick-cut video, Adobe Fonts, PDF / Word / Excel / PowerPoint
- **Blueprint Studio:** brand-styled image and icon generation, brand manager, style gym
- **Engineering:** architecture, system design, code review, debugging, testing strategy, deploy checklist, docs, tech debt, incident response
- **Marketing:** campaign plans, content, email sequences, SEO audit, competitive briefs, brand review, performance reports
- **Content:** LinkedIn posts, blog posts, opinion pieces, Postiz social scheduling
- **Business:** proposals, contract review, invoices, cash flow, CRM, leads, ads, hiring
- **Documents and data:** PDF, Word, Excel, PowerPoint, charts and dashboards, deep research, browser automation

## Connected apps

Connected and working in cloud sessions: **Canva, Gmail, Google Calendar, Google Drive, GitHub, Claude Docs**.

Installed but blocked by the cloud environment's network policy: **Figma, Adobe, Blueprint Studio, Notion, Linear, Asana, Atlassian, HubSpot, Mailchimp, Klaviyo, Ahrefs, Amplitude** and others. To turn them on, open the environment menu in the session's title bar → **Edit** → **Network access**, and either choose a broader access level or add each app's domain under **Allowed domains**. Steps: https://code.claude.com/docs/en/cloud-environments#network-access

Needs sign-in: **Datadog** (claude.ai → Settings → Connectors). **ActiveCampaign** needs its account URL set in `/plugin manage`.
