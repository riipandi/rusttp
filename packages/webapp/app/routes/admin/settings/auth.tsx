import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/auth')({
  component: RouteComponent,
  staticData: { pageTitle: 'Admin' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Account</h1>
        <p {...stylex.props(styles.subtitle)}>Put some description here.</p>
      </div>
    </main>
  )
}
