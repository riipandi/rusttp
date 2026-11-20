import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/security')({
  component: RouteComponent,
  staticData: { pageTitle: 'Security' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Security</h1>
        <p {...stylex.props(styles.subtitle)}>
          Manage your password, two-factor methods, and active sessions.
        </p>
      </div>
    </main>
  )
}
