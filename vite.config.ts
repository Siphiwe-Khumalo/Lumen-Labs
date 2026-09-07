import { defineConfig } from 'vite'
import { env } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: env.GITHUB_ACTIONS === 'true' ? '/Lumen-Labs/' : '/',
  plugins: [react(), tailwindcss()],
})
