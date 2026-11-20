import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/users')({
  component: RouteComponent,
  staticData: { pageTitle: 'Users' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Users</h1>
        <p {...stylex.props(styles.subtitle)}>
          Browse, invite, and manage the people who can sign in.
        </p>
      </div>
    </main>
  )
}
