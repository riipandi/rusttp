import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { PageTitle } from '#/components/page-title'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/scheduler')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_admin_scheduler() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <PageTitle>{m.page_admin_scheduler()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.page_admin_scheduler_description()}</p>
      </div>
    </main>
  )
}
