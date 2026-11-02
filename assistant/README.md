# Lumen — voice assistant

Lumen is a voice-first AI assistant with a heads-up display, powered by Claude. Ask it anything by
voice or text. It answers out loud and, when it helps, fills the screen with live cards: real photos
from the web, headline numbers, charts, lists and clickable sources.

This folder is a separate app. It does not touch the Lumen Labs website in the repo root.

## What it does

- **Talk or type.** Click the ring, tap the mic, or press <kbd>Space</kbd>. Press <kbd>Esc</kbd> to stop.
- **Quick mode** (default, runs on Claude Sonnet for speed): fast answers, up to 3 web searches and
  3 cards. Usually under $0.15.
- **Deep mode**: a full research wall (research status card, stats, charts, photos, sources), up to
  10 searches. Roughly $0.50 to $1.50 per question.
- **Keep talking**: after a spoken answer, the mic reopens for a few seconds so you can just ask a
  follow-up. Stay quiet and it closes by itself. Turn it off in **Settings**.
- **Show it something**: tap the camera lens (opens the camera on Android), or paste / drag a photo
  onto the screen on your laptop. Ask about it, or stay quiet and Lumen describes it. It reads text,
  identifies things and looks them up. Photos are never saved to history. About $0.02 to $0.10.
- **Daily briefing**: **Brief me**, the briefing button on the home screen, or say "brief me". Weather
  for your area, South African headlines, the dollar/rand rate and any warnings, as a card wall
  read out like a morning radio host. About $0.30 to $0.70.
- **Sound design**: a power-up sequence on launch, blips when the mic opens and closes, and soft
  ticks as cards land. All synthesised in the browser, no audio files.
- **Timers**: "set a 10 minute timer". It rings, vibrates on Android and says so out loud.
- **Session cost counter** in the top-right, plus an optional daily spending cap.
- **Settings**: spoken replies, keep talking and interface sounds on/off, plus **Lock**.
- **History**, **Clear view**, **Text** mode, **Mute** (mic), and a **passcode lock** when online.
- **Installable** on Windows (Chrome/Edge) and Android (Chrome) as its own app with an icon.

## Run it on your Windows laptop

You need [Node.js 22 LTS](https://nodejs.org) installed once.

1. Open **Command Prompt** in this `assistant` folder (type `cmd` in File Explorer's address bar).
   PowerShell may block `npm` with a "running scripts is disabled" error.
2. Install the building blocks (first time only):
   ```bash
   npm install
   ```
3. Try it **without an API key** (scripted demo answers, no cost):
   ```bash
   npm run demo
   ```
   Open http://localhost:3000 in Chrome or Edge. Try "how far is the moon", "set a 10 second timer",
   or switch to **Deep** and ask it to research data centres in South Africa.
4. For real answers, copy `.env.example` to a new file called `.env` and paste your key after
   `ANTHROPIC_API_KEY=`. Get it at https://platform.claude.com → Settings → API Keys.
   The `.env` file is ignored by git, so the key never goes to GitHub. Then run:
   ```bash
   npm run dev
   ```

Voice input needs **Chrome or Edge** (in other browsers, use **Text**). Allow the microphone when the
browser asks. On Windows, Edge has the most natural-sounding built-in voices.

## Put it online (for your phone)

The repo's `render.yaml` defines a second Render service, `lumen-assistant`, next to the website.

1. In Render, open the Blueprint for this repo (or **New → Blueprint** and pick the repo) and sync it.
2. Render asks for the secret values:
   - `ANTHROPIC_API_KEY`: your key.
   - `LUMEN_PASSCODE`: the passcode for the lock screen. Pick something long; the server refuses
     to start without one, so nobody else can spend your credit.
3. When it's live, open the `https://lumen-assistant-….onrender.com` address.

The free Render plan sleeps after about 15 minutes idle, so the first question after a break takes
30 to 50 seconds. The $7/month Starter plan keeps it instant (change `plan` in `render.yaml`).

### Install it as an app

- **Android (Chrome):** open the site → menu (⋮) → **Install app** / **Add to Home screen**.
- **Windows (Chrome or Edge):** click the install icon at the right of the address bar.

It then opens in its own window with the Lumen ring icon.

## Settings (`.env` or Render environment)

| Variable                                                 | What it does                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`                                      | Your Claude API key (required for real answers).                                                                          |
| `LUMEN_PASSCODE`                                         | Lock-screen passcode. Required online, optional on your laptop.                                                           |
| `LUMEN_DAILY_BUDGET_USD`                                 | Stop answering after this many dollars per day (resets at midnight UTC and when the server restarts). `0` = no cap.       |
| `LUMEN_HOME_CITY` / `_REGION` / `_COUNTRY` / `_TIMEZONE` | Helps with local questions (weather, news, "near me").                                                                    |
| `LUMEN_MODEL`                                            | Model for Deep research and briefings, default `claude-opus-5-5`.                                                         |
| `LUMEN_QUICK_MODEL`                                      | Model for Quick mode, default `claude-sonnet-5-5` (fast, half the price). `claude-haiku-5-5` is the fastest and cheapest. |

## How it works

```text
assistant/
├── server/          Node + Express. Holds the API key; the browser never sees it.
│   ├── agent.ts     One streamed Claude request per question, with web search
│   ├── reply.ts     Splits the reply into spoken text and cards as it streams
│   ├── images.ts    Finds the main photo (og:image) of pages Claude found, public sites only
│   ├── auth.ts      Passcode lock: signed HttpOnly cookie, rate-limited attempts
│   ├── demo.ts      Scripted answers for `npm run demo`
│   └── index.ts     HTTP server, Server-Sent Events stream, static files
├── shared/          Message types shared by server and HUD
├── src/             React HUD: animated ring (canvas), cards, voice in/out, timers, history
└── public/          App manifest, service worker, icons, demo photos
```

1. Your voice is turned into text by the browser (Web Speech API).
2. The server sends it to Claude in a single streamed request, with web search available.
3. Claude writes the spoken answer first, so Lumen starts talking on the first sentence. The cards
   (stat, chart, list, text, image, timer) follow in the same reply after a `[[cards]]` marker and
   appear one by one while it speaks. Searches and sources show up as they happen.
4. Image cards must come from pages in Claude's search results. The server reads that page's
   preview image, so photos are real and come with their source link.
5. The spoken answer is read aloud sentence by sentence while it streams in.

Cost shown in the HUD is an estimate from token usage at list prices; your exact bill is on
https://platform.claude.com.

## Development

```bash
npm run typecheck   # TypeScript, server and HUD
npm run build       # production build into dist/
npm start           # production server (needs LUMEN_PASSCODE)
node scripts/make-icons.mjs   # re-render PNG icons from public/icons/icon.svg (needs Playwright)
```
