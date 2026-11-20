import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/sessions')({
  component: RouteComponent,
  staticData: { pageTitle: 'Session settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Session settings</h1>
        <p {...stylex.props(styles.subtitle)}>Set session lifetime, idle timeout, and concurrent session limits.</p>
      </div>
    </main>
  )
}
