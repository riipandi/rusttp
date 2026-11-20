import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/messages')({
  component: RouteComponent,
  staticData: { pageTitle: 'Messages' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Messages</h1>
        <p {...stylex.props(styles.subtitle)}>
          Write and publish messages and announcements to show users across the app.
        </p>
      </div>
    </main>
  )
}
