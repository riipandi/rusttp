import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/general')({
  component: RouteComponent,
  staticData: { pageTitle: 'General settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>General settings</h1>
        <p {...stylex.props(styles.subtitle)}>Name, branding, and basic behavior of the instance.</p>
      </div>
    </main>
  )
}
