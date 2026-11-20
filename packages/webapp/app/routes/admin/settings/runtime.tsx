import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/runtime')({
  component: RouteComponent,
  staticData: { pageTitle: 'Runtime settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Runtime settings</h1>
        <p {...stylex.props(styles.subtitle)}>Inspect and tune runtime behavior of the running server.</p>
      </div>
    </main>
  )
}
