import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'

export const Route = createFileRoute('/(app)/notifications')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_app_notifications() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <main {...stylex.props(layout.main, layout.container, styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_app_notifications()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.page_app_notifications_description()}</p>
      </div>
    </main>
  )
}
