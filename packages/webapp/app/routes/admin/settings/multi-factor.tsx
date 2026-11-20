import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/multi-factor')({
  component: RouteComponent,
  staticData: { pageTitle: 'Multi-factor settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Multi-factor settings</h1>
        <p {...stylex.props(styles.subtitle)}>Choose which second factors are offered and when they are required.</p>
      </div>
    </main>
  )
}
