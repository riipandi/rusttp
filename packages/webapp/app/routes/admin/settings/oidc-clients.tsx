import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/oidc-clients')({
  component: RouteComponent,
  staticData: { pageTitle: 'OIDC clients' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>OIDC clients</h1>
        <p {...stylex.props(styles.subtitle)}>
          Register applications that sign users in through this server.
        </p>
      </div>
    </main>
  )
}
