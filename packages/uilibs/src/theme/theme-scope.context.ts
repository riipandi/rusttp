import * as React from 'react'

/** A concrete color mode: what a `ThemeScope` draws once `inverted` is resolved. */
export type ThemeMode = 'light' | 'dark'

export interface ThemeScopeValue {
  /** The mode the nearest scope draws. */
  mode: ThemeMode
  /** The themed element popups open into; `null` until it mounts. */
  container: HTMLElement | null
}

export const ThemeScopeContext = React.createContext<ThemeScopeValue | undefined>(undefined)

/**
 * The portal container for a popup that opens from here. Pass it to a Base UI `Portal`'s
 * `container`. Inside a `ThemeScope` it is the scope's own themed element, so the popup keeps the
 * scope's color mode; the portal waits while it is `null`. Outside a scope it is `undefined`, and
 * Base UI portals to the body as it always did.
 *
 * It lives apart from `theme.tsx` so a popup component does not pull in the theme provider.
 */
export function usePortalContainer(): HTMLElement | null | undefined {
  return React.useContext(ThemeScopeContext)?.container
}
