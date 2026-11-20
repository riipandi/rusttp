import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/protection')({
  component: RouteComponent,
  staticData: { pageTitle: 'Protection settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Protection settings</h1>
        <p {...stylex.props(styles.subtitle)}>
          Rate limits, lockouts, and other safeguards against abuse.
        </p>
      </div>
    </main>
  )
}
