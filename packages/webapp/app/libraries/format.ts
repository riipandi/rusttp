import { useSelector } from '@tanstack/react-store'
import { localeStore } from '#/libraries/locale.store'

// Dates, relative times, and numbers are shown through `Intl` in the language shown: a body from the
// API carries an ISO timestamp or a number, never text written for one language. Each hook
// subscribes to the locale store, like `useMessages`, so a language change formats them again.

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** `Nov 28` / `28 Nov`: a calendar date without the year, for the current year's loans. */
export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(iso))
}

/** `12 minutes ago`, `yesterday`, `2 days ago`: how long before `now` a timestamp is. */
export function formatRelative(iso: string, locale: string, now: number = Date.now()): string {
  const elapsed = new Date(iso).getTime() - now
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const abs = Math.abs(elapsed)
  if (abs < HOUR) return rtf.format(Math.round(elapsed / MINUTE), 'minute')
  if (abs < DAY) return rtf.format(Math.round(elapsed / HOUR), 'hour')
  return rtf.format(Math.round(elapsed / DAY), 'day')
}

/** `2,418` / `2.418`: a count with the language's grouping. */
export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

/** The formatters bound to the language shown; re-renders the caller when it changes. */
export function useFormat() {
  const locale = useSelector(localeStore)
  return {
    date: (iso: string) => formatDate(iso, locale),
    relative: (iso: string) => formatRelative(iso, locale),
    number: (value: number) => formatNumber(value, locale)
  }
}
