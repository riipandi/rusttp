import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/roles')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_admin_roles() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_admin_roles()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.page_admin_roles_description()}</p>
      </div>
    </main>
  )
}
