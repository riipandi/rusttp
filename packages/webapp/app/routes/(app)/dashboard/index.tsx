import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Container } from 'uilibs/extra/container'
import { PageTitle } from '#/components/page-title'
import { loans, summary } from '#/fixtures/loans'
import { getMessages, useMessages } from '#/libraries/messages'
import { layoutSize } from '#/styles/constants.stylex'
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
    <Container
      render={<main aria-busy={busy} />}
      size={layoutSize.page}
      style={[layout.main, layout.gutter, styles.main]}
    >
      <div {...stylex.props(styles.heading)}>
        <PageTitle>{m.page_app_dashboard()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.page_app_dashboard_description()}</p>
      </div>
      {stats}
      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>{m.dashboard_recent_loans()}</h2>
        {table}
      </section>
    </Container>
  )
}

function Pending() {
  return <Page busy stats={<SummarySkeleton />} table={<LoansTableSkeleton />} />
}

function RouteComponent() {
  const data = Route.useLoaderData()

  return <Page stats={<Summary items={data.summary} />} table={<LoansTable loans={data.loans} />} />
}
