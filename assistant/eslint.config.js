// Lint config for the Lumen assistant. Extends the site's rules and adds the right
// globals for the service worker and Node scripts. ESLint resolves plugins from the
// repository root's node_modules.
import globals from 'globals'
import root from '../eslint.config.js'

export default [
  { ignores: ['dist', 'node_modules'] },
  ...root,
  {
    files: ['server/**/*.ts', 'scripts/**/*.mjs', 'vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['public/sw.js'],
    languageOptions: { globals: globals.serviceworker },
  },
]
