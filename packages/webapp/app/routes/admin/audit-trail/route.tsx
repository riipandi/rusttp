import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/audit-trail')({
  component: RouteComponent,
  staticData: { pageTitle: 'Audit trail' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Audit trail</h1>
        <p {...stylex.props(styles.subtitle)}>Review who did what and when across the system.</p>
      </div>
    </main>
  )
}
