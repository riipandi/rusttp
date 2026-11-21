import { defineConfig } from '@inlang/paraglide-js'

// Shared by the Vite plugin and `paraglide-js compile` (the `generate` script), so both write
// the same typed `m.*` functions into the gitignored `app/paraglide`. There is no `url` strategy:
// the language is a per-browser setting (see `app/libraries/locale.store.ts`), never part of a path.
export default defineConfig({
  outdir: './app/paraglide',
  emitTsDeclarations: true,
  localStorageKey: 'locale',
  strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
  // Physical files, not the Vite plugin's virtual modules: the build-time route reader
  // (plugins/vixum) loads the routes in its own Vite server, which has no Paraglide plugin.
  outputStructure: 'message-modules'
})
