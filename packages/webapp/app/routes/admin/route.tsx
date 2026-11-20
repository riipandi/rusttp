import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'
import { Sidebar } from './-sidebar'
import { AdminTopBar } from './-topbar'

// The admin dashboard: a sidebar beside the page, a top bar above it on small screens.
export const Route = createFileRoute('/admin')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div {...stylex.props(styles.root)}>
      <Sidebar />
      <AdminTopBar />
      <div {...stylex.props(styles.content)}>
        <Outlet />
      </div>
    </div>
  )
}
