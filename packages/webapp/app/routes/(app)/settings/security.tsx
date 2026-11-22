import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { PageTitle } from '#/components/page-title'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'

export const Route = createFileRoute('/(app)/settings/security')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_app_security_settings() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <main {...stylex.props(layout.main, layout.container, styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <PageTitle>{m.page_app_security_settings()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.page_app_security_settings_description()}</p>
      </div>
    </main>
  )
}
