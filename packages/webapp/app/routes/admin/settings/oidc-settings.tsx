import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/oidc-settings')({
  component: RouteComponent,
  staticData: { pageTitle: 'OIDC settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>OIDC settings</h1>
        <p {...stylex.props(styles.subtitle)}>
          Configure issuer details and federation with external providers.
        </p>
      </div>
    </main>
  )
}
