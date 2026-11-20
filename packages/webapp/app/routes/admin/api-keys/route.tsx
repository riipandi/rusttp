import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/api-keys')({
  component: RouteComponent,
  staticData: { pageTitle: 'API keys' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>API keys</h1>
        <p {...stylex.props(styles.subtitle)}>Issue, scope, and revoke keys for programmatic access.</p>
      </div>
    </main>
  )
}
