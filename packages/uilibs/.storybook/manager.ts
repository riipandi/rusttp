import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/manager-api'
import { getPreferredColorScheme, themes } from 'storybook/theming'
import { STORYBOOK_THEME_GLOBAL } from './theme-global'

/**
 * Syncs Storybook's manager chrome (sidebar, toolbar, panels) with the `theme`
 * toolbar global — the same global that drives the component theme in the preview
 * via `decorator.tsx`. The key comes from `theme-global.ts`, which holds constants only so the
 * manager bundle does not import preview code.
 */
const isDark = (mode: unknown) =>
  mode === 'dark' || (mode === 'system' && getPreferredColorScheme() === 'dark')

const syncManagerTheme = (mode: unknown) => {
  addons.setConfig({ theme: isDark(mode) ? themes.dark : themes.light })
}

// The addon panel starts hidden (toggle it with `A`); only Base Components starts open; the other groups open on demand (a selected story still
// expands its own group). These are the slugged ids of the top-level titles in `preview.tsx`.
addons.setConfig({
  layout: { showPanel: false, panelPosition: 'right' },
  sidebar: { collapsedRoots: ['extra-components', 'data-grid', 'visualizations', 'contracts'] }
})

addons.register('theme-sync', (api) => {
  syncManagerTheme(api.getGlobals()[STORYBOOK_THEME_GLOBAL])

  api.on(GLOBALS_UPDATED, ({ userGlobals }) => {
    syncManagerTheme(userGlobals[STORYBOOK_THEME_GLOBAL])
  })

  // Follow OS preference changes while the toolbar is on "system"
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    syncManagerTheme(api.getGlobals()[STORYBOOK_THEME_GLOBAL])
  })
})
