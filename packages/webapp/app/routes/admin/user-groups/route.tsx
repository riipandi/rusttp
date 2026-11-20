import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/user-groups')({
  component: RouteComponent,
  staticData: { pageTitle: 'Groups' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Groups</h1>
        <p {...stylex.props(styles.subtitle)}>Organize users into groups and manage their membership.</p>
      </div>
    </main>
  )
}
