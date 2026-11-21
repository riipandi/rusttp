import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'

export const Route = createFileRoute('/(app)/settings/account')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_app_account_settings() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <main {...stylex.props(layout.main, layout.container, styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_app_account_settings()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.page_app_account_settings_description()}</p>
      </div>
    </main>
  )
}
