import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/scheduler')({
  component: RouteComponent,
  staticData: { pageTitle: 'Scheduler' }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Scheduler</h1>
        <p {...stylex.props(styles.subtitle)}>Inspect registered jobs and queues, pending work, and the dead archive.</p>
      </div>
    </main>
  )
}
