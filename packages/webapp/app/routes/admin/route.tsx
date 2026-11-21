import * as stylex from '@stylexjs/stylex'
import { type CustomHotkeys, HotkeysProvider } from '@tanstack/react-hotkeys'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { batch } from '@tanstack/store'
import * as React from 'react'
import { AnnouncementBar } from '#/components/announcement-bar'
import { commandBarStore } from '#/libraries/commandbar.store'
import { appHotkeys } from '#/libraries/hotkeys'
import { useMessages } from '#/libraries/messages'
import { sidebarStore } from '#/libraries/sidebar.store'
import { styles } from '#/styles/pages/admin.stylex'
import { CommandBar, useAdminHotkeys } from './-commandbar'
import { Sidebar, useFoldSidebarOnSettings } from './-sidebar'
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

// The stores outlive this layout: leaving /admin must not bring back an open command bar or a
// settings toggle on the next visit. One batch, so nothing renders between the two resets.
function resetAdminUi() {
  batch(() => {
    commandBarStore.actions.reset()
    sidebarStore.actions.reset()
  })
}

// Reads no store itself: the shortcuts and the sidebar's buttons call the store actions, so a
// collapse or an open command bar renders only the parts that show it, not the whole layout.
function AdminLayout() {
  const m = useMessages()
  useFoldSidebarOnSettings()
  useAdminHotkeys()
  React.useEffect(() => resetAdminUi, [])

  return (
    <div {...stylex.props(styles.root)}>
      <Sidebar />
      <AdminTopBar />
      <div {...stylex.props(styles.content)}>
        <AnnouncementBar label={m.admin_banner_demo_label()} tone='critical'>
          {m.admin_banner_demo_notice()}
        </AnnouncementBar>
        <Outlet />
      </div>
      <CommandBar />
    </div>
  )
}
