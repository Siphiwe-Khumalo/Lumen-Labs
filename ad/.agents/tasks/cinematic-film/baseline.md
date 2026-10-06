# Baseline — cinematic-film run

Mechanical setup for the cinematic brand film. Recorded before any source changes.

## Worktree
- Path: `/projects/sandbox/Lumen-Labs/.worktrees/cinematic-film`
- Branch: `feat/cinematic-brand-film` (based on `main` @ b2db9c8)

## Directories (all exist)
- `ad/.agents/tasks/cinematic-film/`
- `ad/public/footage/`
- `ad/public/audio/vo/`
- `ad/public/audio/music/`
- `ad/out/`

## Install + fonts
- `npm install` — OK (389 packages). npm reports 6 audit vulnerabilities (pre-existing; not addressed per "no source changes").
- `npm run fonts` — OK (space-grotesk, manrope, jetbrains-mono vendored into `public/fonts/`).

## Typecheck
- `npm run typecheck` (`tsc --noEmit`) — **PASS**, zero errors.

## Tests
- `npm test` (`vitest run`) — **FAILS AT STARTUP**, but NOT because of the film code.
  Root cause: the `ad/` subproject has no vitest/vite config of its own, so vitest
  walks up and auto-discovers the OUTER website's `vite.config.ts` at the worktree
  root, which imports `vite` — a package that is intentionally not installed in the
  isolated `ad/` project. Error: `Cannot find package 'vite' imported from .../vite.config.ts`.
- The test suite itself is **GREEN**. Proven by running with a neutral config:
  `vitest run --config <empty>` →
  **5 files passed, 16 tests passed** (copy 2, timeline 3, assets 2, layout 4, interpolate 5).

### Guidance for later steps
To run the `ad/` tests without the outer config interfering, pass a neutral config, e.g.:

```sh
printf 'export default {}\n' > /tmp/empty-vitest.config.ts
node "$NPM" exec -- vitest run --config /tmp/empty-vitest.config.ts
```

If a persistent fix is desired, adding an `ad/vitest.config.ts` (which stops the
upward search) would be a one-line source change — out of scope for this
setup-only step, so NOT done here.
