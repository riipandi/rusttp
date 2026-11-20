import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/account')({
  component: RouteComponent,
  staticData: { pageTitle: 'Account' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Account</h1>
        <p {...stylex.props(styles.subtitle)}>
          Manage your admin profile, password, and sign-in details.
        </p>
      </div>
    </main>
  )
}
