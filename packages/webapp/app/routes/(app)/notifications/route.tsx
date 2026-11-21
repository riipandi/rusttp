import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'

export const Route = createFileRoute('/(app)/notifications')({
  component: RouteComponent,
  staticData: { pageTitle: 'Notifications' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(layout.main, layout.container, styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Notifications</h1>
        <p {...stylex.props(styles.subtitle)}>See all your notifications here.</p>
      </div>
    </main>
  )
}
