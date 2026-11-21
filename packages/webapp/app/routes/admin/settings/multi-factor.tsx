import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/multi-factor')({
  component: RouteComponent,
  staticData: { pageTitle: m.page_admin_settings_multi_factor }
})

function RouteComponent() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_admin_settings_multi_factor()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.page_admin_settings_multi_factor_description()}</p>
      </div>
    </main>
  )
}
