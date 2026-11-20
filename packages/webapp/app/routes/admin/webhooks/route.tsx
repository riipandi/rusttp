import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/webhooks')({
  component: RouteComponent,
  staticData: { pageTitle: 'Webhooks' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Webhooks</h1>
        <p {...stylex.props(styles.subtitle)}>
          Send event notifications to external endpoints and track deliveries.
        </p>
      </div>
    </main>
  )
}
