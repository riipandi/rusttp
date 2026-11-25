import { CircleCheck } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Stack } from 'uilibs/extra/stack'
import { PageTitle } from '#/components/page-title'
import { StatusIcon } from '#/components/status-icon'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/email-verified')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_auth_email_verified() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <>
      <Stack gap={2}>
        <StatusIcon svg={CircleCheck} color='positive' />
        <PageTitle>{m.page_auth_email_verified()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_verified_subtitle()}</p>
      </Stack>

      <Button render={<RouterLink to='/login' />} size='large'>
        {m.auth_verified_action()}
      </Button>
    </>
  )
}
