import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from './colors.stylex'

/**
 * Dark theme — a single `stylex.createTheme` per variable group. Values are
 * static by design: StyleX resolves `createTheme` at compile time, so add
 * variations by writing more `createTheme` calls here, not by computing them
 * at runtime. A theme need not override every token: a partial one composes
 * with a full one and the later theme wins per token, e.g.
 * `stylex.props(darkTheme, brandTheme)`.
 */
const darkColors = stylex.createTheme(colors, {
  backgroundCriticalFaded: 'oklch(0.24 0.0167 20.28)',
  backgroundCriticalHighlightedFaded: 'oklch(0.5842 0.164 20.28 / 0.08)',
  backgroundCriticalHighlighted: 'oklch(0.54 0.164 20.28)',
  backgroundCritical: 'oklch(0.5842 0.164 20.28)',
  backgroundElevationBase: 'oklch(0.2 0 89.88)',
  backgroundElevationOverlay: 'oklch(0.24 0 89.88)',
  backgroundNeutralFaded: 'oklch(1 0 89.88 / 0.04)',
  backgroundNeutralHighlightedFaded: 'oklch(1 0 0 / 0.05)',
  backgroundNeutralHighlighted: 'oklch(0.3608 0 89.88)',
  backgroundNeutral: 'oklch(0.32 0 89.88)',
  backgroundPageFaded: 'oklch(0.18 0 89.88)',
  backgroundPage: 'oklch(0.16 0 89.88)',
  backgroundPositiveFaded: 'oklch(0.24 0.0106 151.8)',
  backgroundPositiveHighlightedFaded: 'oklch(0.527 0.104 151.8 / 0.08)',
  backgroundPositiveHighlighted: 'oklch(0.5 0.104 151.8)',
  backgroundPositive: 'oklch(0.527 0.104 151.8)',
  backgroundPrimaryFaded: 'oklch(0.24 0.018 39.4)',
  backgroundPrimaryHighlightedFaded: 'oklch(0.55 0.135 39.4 / 0.08)',
  backgroundPrimaryHighlighted: 'oklch(0.58 0.14 39.4)',
  backgroundPrimary: 'oklch(0.55 0.135 39.4)',
  backgroundTrack: 'oklch(0.25 0 89.88)',
  backgroundWarningFaded: 'oklch(0.24 0.018 80)',
  backgroundWarningHighlightedFaded: 'oklch(0.8108 0.176 80 / 0.08)',
  backgroundWarningHighlighted: 'oklch(0.7297 0.176 80)',
  backgroundWarning: 'oklch(0.8108 0.176 80)',
  borderCriticalFaded: 'oklch(0.3 0.0167 20.28)',
  borderControl: 'oklch(0.64 0 89.88)',
  borderCritical: 'oklch(0.6842 0.164 20.28)',
  borderDisabled: 'oklch(1 0 89.88 / 0.06)',
  borderNeutralFaded: 'oklch(1 0 89.88 / 0.08)',
  borderNeutral: 'oklch(1 0 89.88 / 0.11)',
  borderPositiveFaded: 'oklch(0.3 0.0106 151.8)',
  borderPositive: 'oklch(0.627 0.104 151.8)',
  borderPrimaryFaded: 'oklch(0.3 0.018 39.4)',
  borderPrimary: 'oklch(0.65 0.12 45.84)',
  borderWarningFaded: 'oklch(0.3 0.018 80)',
  borderWarning: 'oklch(0.9108 0.176 80)',
  foregroundCritical: 'oklch(0.75 0.1742 20.28)',
  foregroundDisabled: 'oklch(0.45 0 89.88)',
  foregroundNeutralFaded: 'oklch(0.74 0 89.88)',
  foregroundNeutral: 'oklch(0.96 0 89.88)',
  foregroundPositive: 'oklch(0.75 0.1105 151.8)',
  foregroundPrimary: 'oklch(0.756 0.115 45.84)',
  foregroundWarning: 'oklch(0.75 0.187 80)',
  chart1: 'oklch(0.72 0.13 250)',
  chart2: 'oklch(0.74 0.14 50)',
  chart3: 'oklch(0.76 0.10 195)',
  chart4: 'oklch(0.74 0.15 350)',
  chart5: 'oklch(0.82 0.14 95)',
  chart6: 'oklch(0.72 0.14 305)',
  chart7: 'oklch(0.76 0.14 150)',
  chart8: 'oklch(0.72 0 89.88)'
})

const darkShadows = stylex.createTheme(shadow, {
  outline:
    '0px -1px 2px -0.5px rgba(255, 255, 255, 0.06), 0px -1px 3px -1px rgba(255, 255, 255, 0.05)',
  raised: '0px 8px 12px -4px rgba(0, 0, 0, 0.08), 0px -1.5px 2px -1px rgba(255, 255, 255, 0.1)',
  overlay:
    '0px 16px 24px -4px rgba(0, 0, 0, 0.06), 0px 8px 12px -4px rgba(0, 0, 0, 0.06), 0px 8px 6px -4px rgba(0, 0, 0, 0.06)'
})

/**
 * Compiled class names for the dark theme, applied to `documentElement` by
 * the ThemeProvider. Themes are applied to the root element (not a wrapper):
 * dialogs and popovers portal out and would escape a subtree theme.
 */
export const darkThemeClass = stylex.props(darkColors, darkShadows).className ?? ''

export { darkColors, darkShadows }
