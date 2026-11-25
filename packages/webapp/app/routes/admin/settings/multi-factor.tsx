import * as stylex from '@stylexjs/stylex'
import { createFileRoute } from '@tanstack/react-router'
import { Stack } from 'uilibs/extra/stack'
import { PageTitle } from '#/components/page-title'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/admin.stylex'

export const Route = createFileRoute('/admin/settings/multi-factor')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_admin_settings_multi_factor() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <Stack render={<main />} gap={10} style={styles.main}>
      <Stack gap={1}>
        <PageTitle>{m.page_admin_settings_multi_factor()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.page_admin_settings_multi_factor_description()}</p>
      </Stack>
    </Stack>
  )
}
