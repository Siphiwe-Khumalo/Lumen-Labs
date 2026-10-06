import { defineConfig } from 'vitest/config';

// Neutral, self-contained Vitest config for the ad/ subproject.
// Without this file, a bare `vitest` walks up the directory tree and
// auto-discovers the OUTER website's vite.config.ts (which imports `vite`,
// not installed here), failing to start with "Cannot find package 'vite'".
// Keeping this config minimal isolates the ad/ test suite.
export default defineConfig({});
