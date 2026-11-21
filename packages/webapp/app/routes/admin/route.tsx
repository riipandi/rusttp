import * as stylex from '@stylexjs/stylex'
import { type CustomHotkeys, HotkeysProvider } from '@tanstack/react-hotkeys'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import * as React from 'react'
import { appHotkeys } from '#/libraries/hotkeys'
import { styles } from '#/styles/pages/admin.stylex'
import { CommandBar, useAdminHotkeys } from './-commandbar'
import { Sidebar, useSidebarCollapse } from './-sidebar'
import { AdminTopBar } from './-topbar'

// The admin dashboard: a sidebar beside the page, a top bar above it on small screens.
export const Route = createFileRoute('/admin')({
  component: RouteComponent
})

// The user's own bindings, saved per browser. Only what differs from the declared defaults is
// stored, keyed by app hotkey id, so a default changed later still reaches people who never
// rebound it. A read or write that throws leaves the defaults in place for the session.
const hotkeysKey = 'admin-hotkeys'

function readCustomHotkeys(): CustomHotkeys {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(hotkeysKey) ?? '{}')
    // Anything that is not a plain object (a hand-edited value, an older shape) is ignored; ids and
    // hotkeys the code no longer knows are dropped by the provider itself.
    return typeof stored === 'object' && stored !== null && !Array.isArray(stored) ? stored : {}
  } catch {
    return {}
  }
}

function saveCustomHotkeys(custom: CustomHotkeys) {
  try {
    localStorage.setItem(hotkeysKey, JSON.stringify(custom))
  } catch {}
}

function RouteComponent() {
  // Read once, on the client, before the first paint; the provider takes over after that.
  const [saved] = React.useState(readCustomHotkeys)

  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={saved}
      onCustomHotkeysChange={saveCustomHotkeys}
    >
      <AdminLayout />
    </HotkeysProvider>
  )
}

function AdminLayout() {
  const { collapsed, setCollapsed } = useSidebarCollapse()
  const [bar, setBar] = React.useState<{ open: boolean; panel: 'commands' | 'shortcuts' }>({
    open: false,
    panel: 'commands'
  })

  useAdminHotkeys({
    toggleSidebar: () => setCollapsed(!collapsed),
    openCommandBar: () => setBar({ open: true, panel: 'commands' }),
    openShortcuts: () => setBar({ open: true, panel: 'shortcuts' })
  })

  return (
    <div {...stylex.props(styles.root)}>
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onOpenCommandBar={() => setBar({ open: true, panel: 'commands' })}
      />
      <AdminTopBar />
      <div {...stylex.props(styles.content)}>
        <Outlet />
      </div>
      <CommandBar
        open={bar.open}
        panel={bar.panel}
        onOpenChange={(open) => setBar((current) => ({ ...current, open, panel: 'commands' }))}
        onPanelChange={(panel) => setBar({ open: true, panel })}
      />
    </div>
  )
}
