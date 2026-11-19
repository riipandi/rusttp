import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'
import { Sidebar } from './-sidebar'

// The admin dashboard: a sidebar beside the page.
export const Route = createFileRoute('/admin')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div {...stylex.props(styles.root)}>
      <Sidebar />
      <div {...stylex.props(styles.content)}>
        <Outlet />
      </div>
    </div>
  )
}
