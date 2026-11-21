import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/roles')({
  component: RouteComponent,
  staticData: { pageTitle: 'Roles' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Roles</h1>
        <p {...stylex.props(styles.subtitle)}>
          Manage roles, permissions, and the policies that decide who can do what.
        </p>
      </div>
    </main>
  )
}
