import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Stack } from 'uilibs/extra/stack'
import { getMessages } from '#/libraries/messages'
import { useCompact } from '#/libraries/viewport'
import { styles } from '#/styles/pages/admin.stylex'
import { SettingsNav } from './-settings-nav'

export const Route = createFileRoute('/admin/settings')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_admin_settings() }
})

function RouteComponent() {
  const compact = useCompact()
  return (
    <Stack direction={compact ? 'column' : 'row'} align={compact ? 'stretch' : 'start'}>
      <SettingsNav />
      <div {...stylex.props(styles.settingsContent)}>
        <Outlet />
      </div>
    </Stack>
  )
}
