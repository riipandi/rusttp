import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
  staticData: { pageTitle: 'Overview' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Overview</h1>
        <p {...stylex.props(styles.subtitle)}>Run the Hogwarts library from here.</p>
      </div>
    </main>
  )
}
