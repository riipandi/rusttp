import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/notifications')({
  component: RouteComponent,
  staticData: { pageTitle: 'Notifications' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Notifications</h1>
        <p {...stylex.props(styles.subtitle)}>
          Choose which events notify admins and where they are sent.
        </p>
      </div>
    </main>
  )
}
