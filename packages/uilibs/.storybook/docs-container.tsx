import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'
import * as React from 'react'
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { themes } from 'storybook/theming'
import { UIProvider } from '../src/base/provider'
import { useMediaQuery } from '../src/hooks/use-media-query'
import { ThemeProvider } from '../src/theme'
import { canvasBackgroundCss, ephemeralStorage, isStorybookTheme } from './decorator'
import { STORYBOOK_THEME_GLOBAL, type StorybookTheme } from './decorator'

function themeFrom(globals: unknown): StorybookTheme | undefined {
  if (typeof globals !== 'object' || globals === null) return undefined
  const value: unknown = Reflect.get(globals, STORYBOOK_THEME_GLOBAL)
  return isStorybookTheme(value) ? value : undefined
}

// Docs pages render outside any story, so the story decorator never wraps them. The toolbar
// value arrives on the channel; the URL (`?globals=theme:dark`) covers a page opened directly.
function useThemeGlobal(): StorybookTheme {
  const [theme, setTheme] = React.useState<StorybookTheme>(() => {
    const param = new URLSearchParams(window.location.search).get('globals') ?? ''
    const fromUrl = param
      .split(';')
      .find((entry) => entry.startsWith(`${STORYBOOK_THEME_GLOBAL}:`))
      ?.slice(STORYBOOK_THEME_GLOBAL.length + 1)
    return isStorybookTheme(fromUrl) ? fromUrl : 'system'
  })

  React.useEffect(() => {
    const channel = addons.getChannel()
    const onGlobals = (payload: unknown) => {
      const next =
        typeof payload === 'object' && payload !== null
          ? (themeFrom(Reflect.get(payload, 'userGlobals')) ??
            themeFrom(Reflect.get(payload, 'globals')))
          : undefined
      if (next) setTheme(next)
    }
    channel.on(SET_GLOBALS, onGlobals)
    channel.on(GLOBALS_UPDATED, onGlobals)
    return () => {
      channel.off(SET_GLOBALS, onGlobals)
      channel.off(GLOBALS_UPDATED, onGlobals)
    }
  }, [])

  return theme
}

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
        <style dangerouslySetInnerHTML={{ __html: canvasBackgroundCss }} />
        <DocsContainer context={context} theme={dark ? themes.dark : themes.light}>
          {children}
        </DocsContainer>
      </ThemeProvider>
    </UIProvider>
  )
}
