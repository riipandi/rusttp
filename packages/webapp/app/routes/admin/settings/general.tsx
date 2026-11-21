import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/general')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_admin_settings_general() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_admin_settings_general()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.page_admin_settings_general_description()}</p>
      </div>
    </main>
  )
}
