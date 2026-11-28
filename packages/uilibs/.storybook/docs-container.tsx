import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'
import * as React from 'react'
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { themes } from 'storybook/theming'
import { UIProvider } from '../src/base/provider'
import { useMediaQuery } from '../src/hooks/use-media-query'
import { ThemeProvider } from '../src/theme'
import { canvasBackgroundCss, ephemeralStorage } from './decorator'
import { isStorybookTheme, STORYBOOK_THEME_GLOBAL, type StorybookTheme } from './theme-global'

function member(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined
}

function themeFrom(globals: unknown): StorybookTheme | undefined {
  const value = member(globals, STORYBOOK_THEME_GLOBAL)
  return isStorybookTheme(value) ? value : undefined
}

// Docs pages render outside any story, so the story decorator never wraps them. The toolbar
// value is read from the preview's store, which holds it from the first render.
//
// The container's own state and the iframe URL are not enough: Storybook reloads the iframe after
// a toolbar change, with the URL it already had, and the toolbar's default (`system`) is not in
// the URL at all, so a page that went light then system would start on `light`. The channel
// event that carries the new value can arrive before the container mounts, so nothing here
// waits for one: an event only asks React to read the store again.
function themeFromStore(): StorybookTheme | undefined {
  const preview = member(window, '__STORYBOOK_PREVIEW__')
  const userGlobals = member(member(preview, 'storyStoreValue'), 'userGlobals')
  const get = member(userGlobals, 'get')
  return typeof get === 'function' ? themeFrom(Reflect.apply(get, userGlobals, [])) : undefined
}

// The last value seen on the channel or in the URL, for a store that is not there yet.
function themeFromUrl(): StorybookTheme {
  const param = new URLSearchParams(window.location.search).get('globals') ?? ''
  const fromUrl = param
    .split(';')
    .find((entry) => entry.startsWith(`${STORYBOOK_THEME_GLOBAL}:`))
    ?.slice(STORYBOOK_THEME_GLOBAL.length + 1)
  return isStorybookTheme(fromUrl) ? fromUrl : 'system'
}

let lastSeen = themeFromUrl()

const getTheme = () => themeFromStore() ?? lastSeen

function useThemeGlobal(): StorybookTheme {
  const subscribe = React.useCallback((notify: () => void) => {
    const channel = addons.getChannel()
    const onGlobals = (payload: unknown) => {
      const next =
        themeFrom(member(payload, 'userGlobals')) ?? themeFrom(member(payload, 'globals'))
      if (next) lastSeen = next
      notify()
    }
    channel.on(SET_GLOBALS, onGlobals)
    channel.on(GLOBALS_UPDATED, onGlobals)
    return () => {
      channel.off(SET_GLOBALS, onGlobals)
      channel.off(GLOBALS_UPDATED, onGlobals)
    }
  }, [])
  return React.useSyncExternalStore(subscribe, getTheme, getTheme)
}

// A props table is wider than a phone: it scrolls inside the page instead of widening it. Inline
// code in a paragraph or list wraps, so a long JSX snippet does not widen the page either.
const docsTableCss = `.sbdocs table { display: block; max-width: 100%; overflow-x: auto; }
.sbdocs :is(p, li) code { overflow-wrap: anywhere; white-space: normal; }`

export function ThemedDocsContainer({
  children,
  context
}: React.PropsWithChildren<DocsContainerProps>) {
  const theme = useThemeGlobal()
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)

  return (
    <UIProvider direction='ltr'>
      <ThemeProvider
        attribute='data-theme'
        defaultTheme='system'
        forcedTheme={theme === 'system' ? undefined : theme}
        storage={ephemeralStorage}
      >
        <style dangerouslySetInnerHTML={{ __html: canvasBackgroundCss + docsTableCss }} />
        <DocsContainer context={context} theme={dark ? themes.dark : themes.light}>
          {children}
        </DocsContainer>
      </ThemeProvider>
    </UIProvider>
  )
}
