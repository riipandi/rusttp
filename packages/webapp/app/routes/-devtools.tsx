import { TanStackDevtools, type TanStackDevtoolsReactInit } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { useTheme } from 'uilibs/theme'
// Inlined rather than imported for side effects, so the styles drop out of production builds with the component.
import triggerStyles from '#/routes/-devtools.css?inline'

const SETTINGS_KEY = 'tanstack_devtools_settings'

// Shift+D toggles the panel. `@tanstack/devtools-vite` strips this component from production
// builds. Settings saved from the devtools settings tab (localStorage `tanstack_devtools_settings`)
// take precedence over `config`.
//
// The shell reads `config` once, when it is created, and the saved settings outrank it, so a theme
// passed through `config` alone never follows the app. Following the app therefore means writing
// the theme into the saved settings and creating the shell again (the `key` on the themed child);
// the query panel takes its `theme` as a live prop. The router panel has no theme option and takes
// the shell's.
export default function DevTools({ queryClient }: { queryClient: QueryClient }) {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'
  return <ThemedDevTools key={theme} theme={theme} queryClient={queryClient} />
}

function saveTheme(theme: 'light' | 'dark') {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')
    if (saved.theme !== theme)
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...saved, theme }))
  } catch {
    // No storage (server render) or unreadable settings: the shell falls back to `config.theme`.
  }
}

interface ThemedDevToolsProps {
  theme: 'light' | 'dark'
  queryClient: QueryClient
}

function ThemedDevTools({ theme, queryClient }: ThemedDevToolsProps) {
  // A lazy initializer runs once per mount, before the shell below is created and reads the
  // saved settings; it is idempotent, so a repeated call (strict mode) is harmless.
  React.useState(() => saveTheme(theme))

  const devToolsOptions: Partial<TanStackDevtoolsReactInit> = {
    config: {
      position: 'bottom-right',
      panelLocation: 'bottom',
      inspectHotkey: ['Alt', 'CtrlOrMeta'],
      openHotkey: ['Shift', 'D'],
      hideUntilHover: false,
      requireUrlFlag: false,
      triggerHidden: false,
      triggerMode: 'fixed',
      customTrigger: <DevtoolsIcon />,
      urlFlag: 'devtools',
      theme
    },
    plugins: [
      {
        name: 'TanStack Query',
        render: <ReactQueryDevtoolsPanel client={queryClient} theme={theme} />,
        defaultOpen: true
      },
      {
        name: 'TanStack Router',
        render: <TanStackRouterDevtoolsPanel />,
        defaultOpen: false
      }
    ]
  }

  return <TanStackDevtools {...devToolsOptions} />
}

// Bug glyph from Lucide (ISC license).
function DevtoolsIcon() {
  return (
    <span className='devtools-trigger'>
      <style>{triggerStyles}</style>
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-label='Open devtools'
        role='img'
      >
        <path d='m8 2 1.88 1.88' />
        <path d='M14.12 3.88 16 2' />
        <path d='M9 7.13v-1a3.003 3.003 0 1 1 6 0v1' />
        <path d='M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6' />
        <path d='M12 20v-9' />
        <path d='M6.53 9C4.6 8.8 3 7.1 3 5' />
        <path d='M6 13H2' />
        <path d='M3 21c0-2.1 1.7-3.9 3.8-4' />
        <path d='M20.97 5c0 2.1-1.6 3.8-3.5 4' />
        <path d='M22 13h-4' />
        <path d='M17.2 17c2.1.1 3.8 1.9 3.8 4' />
      </svg>
    </span>
  )
}
