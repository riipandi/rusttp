import { useSelector } from '@tanstack/react-store'
import { localeStore } from '#/libraries/locale.store'
// The only module that imports the generated messages directly (and `schemas/`, which read at
// validation time): `.oxlintrc.json` bans the import everywhere else, so no message is rendered
// without going through `useMessages`.
import { m } from '#/paraglide/messages'
import type { Locale } from '#/paraglide/runtime'

/** Every message of the catalogs, keyed as in `app/locales/*.json`. */
export type Messages = typeof m

type Message = (inputs?: object, options?: { locale?: Locale }) => string

const perLocale = new Map<Locale, Messages>()

// One object per locale, each message pinned to it. The object is the dependency a component
// declares by calling `useMessages()`: the React Compiler memoizes on it, so a language change
// (a different object) re-renders every component that shows a message, and a memoized one keeps
// no stale text. `m` itself would not do: it is one object for every language.
function forLocale(locale: Locale): Messages {
  let messages = perLocale.get(locale)
  if (!messages) {
    const pinned: Record<string, Message> = {}
    // The generated module is a namespace of functions with per-message input types; they are all
    // callable the same way (`inputs`, `{ locale }`), which is what this wrapper relies on.
    for (const [key, message] of Object.entries(m)) {
      if (typeof message !== 'function') continue
      const call: Message = (inputs, options) =>
        Reflect.apply(message, undefined, [inputs ?? {}, options])
      pinned[key] = (inputs, options) => call(inputs, { ...options, locale })
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- `pinned` holds every key of `m`, each callable as `Messages[key]`
    messages = pinned as unknown as Messages
    perLocale.set(locale, messages)
  }
  return messages
}

/** The messages in the language shown; re-renders the caller when the language changes. */
export function useMessages(): Messages {
  return forLocale(useSelector(localeStore))
}

/**
 * The messages in the language shown right now, for code that is not a component: a route's
 * `staticData`, called by `__root.tsx` while it renders (it re-renders on a language change).
 * A component calls `useMessages` instead, or it would not re-render.
 */
export function getMessages(): Messages {
  return forLocale(localeStore.get())
}
