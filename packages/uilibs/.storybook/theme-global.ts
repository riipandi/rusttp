// The `theme` toolbar global's key and values. Constants only, no React or provider imports: the
// manager bundle (`manager.ts`) must not pull in preview code, and the preview (`decorator.tsx`,
// `docs-container.tsx`, `preview.tsx`) reads the same key, so it lives in one file.
export const STORYBOOK_THEME_GLOBAL = 'theme' as const

const STORYBOOK_THEMES = ['light', 'dark', 'system'] as const

export type StorybookTheme = (typeof STORYBOOK_THEMES)[number]

export function isStorybookTheme(value: unknown): value is StorybookTheme {
  return typeof value === 'string' && (STORYBOOK_THEMES as readonly string[]).includes(value)
}
