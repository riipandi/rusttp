import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { darkColors, darkShadows, lightColors, lightShadows } from '../styles/themes'
import type { PartProps } from '../styles/types'
import { useTheme } from './theme'
import { ThemeScopeContext, type ThemeMode } from './theme-scope.context'
import { themeScopeSchemes, themeScopeStyles as s } from './theme-scope.stylex'

export type ThemeScopeColorMode = ThemeMode | 'inverted'

export interface ThemeScopeProps extends PartProps<useRender.ComponentProps<'div'>> {
  /**
   * The mode of the subtree: `dark` or `light`, whatever the page is, or `inverted`, the opposite
   * of the surrounding mode (the page's, or the enclosing scope's).
   */
  colorMode: ThemeScopeColorMode
  style?: stylex.StyleXStyles
}

const themes = {
  dark: [darkColors, darkShadows],
  light: [lightColors, lightShadows]
} as const

const opposite = { dark: 'light', light: 'dark' } as const

const subscribeToNothing = () => () => {}
const getIsMounted = () => true
const getIsMountedOnServer = () => false

/**
 * Draws a subtree in its own color mode: a dark sidebar on a light page, a light card on a dark
 * one. Tokens are CSS variables, so the scope's theme class changes them for everything inside.
 *
 * A popup opened from inside a scope portals out of it. Each portaling component passes
 * `usePortalContainer()` as its portal's `container`, which inside a scope is a sibling themed
 * element at the end of the body: the popup keeps the scope's mode, and no `overflow` of the scope
 * clips it.
 */
export function ThemeScope({ colorMode, style, render, ref, children, ...props }: ThemeScopeProps) {
  const { resolvedTheme, forcedTheme } = useTheme()
  const enclosing = React.useContext(ThemeScopeContext)
  // The provider's `resolvedTheme` ignores `forcedTheme`, so the pinned theme wins here.
  const page = forcedTheme ?? resolvedTheme
  const surrounding: ThemeMode = enclosing?.mode ?? (page === 'dark' ? 'dark' : 'light')
  const mode = colorMode === 'inverted' ? opposite[surrounding] : colorMode

  const [container, setContainer] = React.useState<HTMLElement | null>(null)
  const mounted = React.useSyncExternalStore(subscribeToNothing, getIsMounted, getIsMountedOnServer)
  const value = React.useMemo(() => ({ mode, container }), [mode, container])

  const root = useRender({
    defaultTagName: 'div',
    ref,
    render,
    props: mergeProps<'div'>(
      {
        ...stylex.props(themes[mode], s.root, themeScopeSchemes[mode], style),
        'data-color-mode': mode
      } as React.ComponentPropsWithRef<'div'>,
      { ...props, children }
    )
  })

  return (
    <ThemeScopeContext.Provider value={value}>
      {root}
      {mounted
        ? createPortal(
            <div
              ref={setContainer}
              data-color-mode={mode}
              data-theme-scope-portal=''
              {...stylex.props(themes[mode], themeScopeSchemes[mode])}
            />,
            document.body
          )
        : null}
    </ThemeScopeContext.Provider>
  )
}
