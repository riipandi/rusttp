import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/oauth-providers')({
  component: RouteComponent,
  staticData: { pageTitle: 'OAuth providers' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>OAuth providers</h1>
        <p {...stylex.props(styles.subtitle)}>
          Connect external identity providers for social and federated sign-in.
        </p>
      </div>
    </main>
  )
}
