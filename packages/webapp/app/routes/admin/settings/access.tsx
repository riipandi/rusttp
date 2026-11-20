import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/access')({
  component: RouteComponent,
  staticData: { pageTitle: 'Access & signup settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Access & signup settings</h1>
        <p {...stylex.props(styles.subtitle)}>Control who may sign up and how access is granted.</p>
      </div>
    </main>
  )
}
