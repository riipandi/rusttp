import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'

export const Route = createFileRoute('/(app)/settings/account')({
  component: RouteComponent,
  staticData: { pageTitle: 'Account Settings' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(layout.main, layout.container, styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Account Settings</h1>
        <p {...stylex.props(styles.subtitle)}>Loans at the Hogwarts library this week.</p>
      </div>
    </main>
  )
}
