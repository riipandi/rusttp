import { createStore } from '@tanstack/store'
import {
  baseLocale,
  getLocale,
  getTextDirection,
  type Locale,
  setLocale as persistLocale
} from '#/paraglide/runtime'

// The language of the interface. Paraglide's `m.*` functions read the locale at call time and know
// nothing about React, so this store is what the app subscribes to: `useMessages` and `useFormat`
// re-render their callers in place when it changes (no remount, so typed input and focus stay).
// The browser remembers the choice in `localStorage`; the first visit takes the browser's language
// and falls back to English (`project.inlang/paraglide.config.ts`). There is no locale in the URL.
export const localeNames: Record<Locale, string> = { en: 'English', id: 'Bahasa Indonesia' }

function read(): Locale {
  // The build-time route reader (plugins/vixum) imports this module in Node,
  // where there is no browser to ask.
  return typeof window === 'undefined' ? baseLocale : getLocale()
}

// The server's document says `lang="en"` for every page; the browser corrects it, so a screen
// reader and the browser's own translation offer follow the language shown.
function syncDocument(locale: Locale) {
  document.documentElement.lang = locale
  document.documentElement.dir = getTextDirection(locale)
}

export const localeStore = createStore(read(), ({ setState, get }) => ({
  /** Persists the choice and renders it; a locale already shown is a no-op. */
  set: (locale: Locale) => {
    if (get() === locale) return
    // `reload: false` is Paraglide's escape hatch for a client-rendered app without a `url`
    // strategy: it only stores the choice, the re-render is the store's job.
    void persistLocale(locale, { reload: false })
    syncDocument(locale)
    setState(() => locale)
  }
}))

if (typeof window !== 'undefined') syncDocument(localeStore.get())
