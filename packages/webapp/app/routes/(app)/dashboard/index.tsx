import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { loans, summary } from '#/fixtures/loans'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { LoansTable } from './-loans-table'
import { LoansTableSkeleton, SummarySkeleton } from './-skeleton'
import { Summary } from './-summary'

export const Route = createFileRoute('/(app)/dashboard/')({
  // The sample data is local, so this resolves at once; a real fetch here is what puts
  // `pendingComponent` on screen while it loads.
  loader: () => ({ summary, loans }),
  pendingComponent: Pending,
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_app_dashboard() }
})

function Page({ busy, stats, table }: { busy?: boolean; stats: ReactNode; table: ReactNode }) {
  const m = useMessages()
  return (
    <main aria-busy={busy} {...stylex.props(layout.main, layout.container, styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_app_dashboard()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.page_app_dashboard_description()}</p>
      </div>
      {stats}
      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>{m.dashboard_recent_loans()}</h2>
        {table}
      </section>
    </main>
  )
}

function Pending() {
  return <Page busy stats={<SummarySkeleton />} table={<LoansTableSkeleton />} />
}

function RouteComponent() {
  const data = Route.useLoaderData()

  return <Page stats={<Summary items={data.summary} />} table={<LoansTable loans={data.loans} />} />
}
