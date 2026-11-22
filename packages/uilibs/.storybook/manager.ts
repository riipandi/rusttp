import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/manager-api'
import { getPreferredColorScheme, themes } from 'storybook/theming'

/**
 * Syncs Storybook's manager chrome (sidebar, toolbar, panels) with the `theme`
 * toolbar global — the same global that drives the component theme in the preview
 * via `decorator.tsx`. Keep the key in sync with `STORYBOOK_THEME_GLOBAL`
 * (duplicated here because the manager bundle must not import preview code).
 */
const THEME_GLOBAL = 'theme'

const isDark = (mode: unknown) =>
  mode === 'dark' || (mode === 'system' && getPreferredColorScheme() === 'dark')

const syncManagerTheme = (mode: unknown) => {
  addons.setConfig({ theme: isDark(mode) ? themes.dark : themes.light })
}

// The addon panel starts hidden (toggle it with `A`); only Base Components starts open; the other groups open on demand (a selected story still
// expands its own group). These are the slugged ids of the top-level titles in `preview.tsx`.
addons.setConfig({
  showPanel: false,
  sidebar: { collapsedRoots: ['extra-components', 'data-grid', 'visualizations', 'contracts'] }
})

addons.register('theme-sync', (api) => {
  syncManagerTheme(api.getGlobals()[THEME_GLOBAL])

  api.on(GLOBALS_UPDATED, ({ userGlobals }) => {
    syncManagerTheme(userGlobals[THEME_GLOBAL])
  })

  // Follow OS preference changes while the toolbar is on "system"
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    syncManagerTheme(api.getGlobals()[THEME_GLOBAL])
  })
})
