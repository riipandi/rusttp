import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/auth')({
  component: RouteComponent,
  staticData: { pageTitle: 'User & authentication settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>User & authentication settings</h1>
        <p {...stylex.props(styles.subtitle)}>
          How users register, identify themselves, and sign in.
        </p>
      </div>
    </main>
  )
}
