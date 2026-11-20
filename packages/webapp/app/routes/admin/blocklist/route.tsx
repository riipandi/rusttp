import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/blocklist')({
  component: RouteComponent,
  staticData: { pageTitle: 'Blocklist' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Blocklist</h1>
        <p {...stylex.props(styles.subtitle)}>Block abusive addresses, accounts, and email domains.</p>
      </div>
    </main>
  )
}
