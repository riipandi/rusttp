import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { DashboardHeader } from './-components/dashboard-header'
import { LoansTable } from './-components/loans-table'
import { Summary } from './-components/summary'

export const Route = createFileRoute('/(app)/dashboard/')({
  component: RouteComponent,
  staticData: { pageTitle: 'Dashboard' }
})

function RouteComponent() {
  return (
    <div {...stylex.props(layout.root)}>
      <DashboardHeader />
      <main {...stylex.props(layout.main, layout.container, styles.main)}>
        <div {...stylex.props(styles.heading)}>
          <h1 {...stylex.props(styles.title)}>Dashboard</h1>
          <p {...stylex.props(styles.subtitle)}>Loans at the Hogwarts library this week.</p>
        </div>
        <Summary />
        <section {...stylex.props(styles.section)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Recent loans</h2>
          <LoansTable />
        </section>
      </main>
    </div>
  )
}
