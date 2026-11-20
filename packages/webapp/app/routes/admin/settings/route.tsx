import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'
import { SettingsNav } from './-settings-nav'

export const Route = createFileRoute('/admin/settings')({
  component: RouteComponent,
  staticData: { pageTitle: 'Settings' }
})

function RouteComponent() {
  return (
    <div {...stylex.props(styles.settings)}>
      <SettingsNav />
      <div {...stylex.props(styles.settingsContent)}>
        <Outlet />
      </div>
    </div>
  )
}
