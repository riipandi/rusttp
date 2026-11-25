import { Mail } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Link } from 'uilibs/extra/link'
import { Stack } from 'uilibs/extra/stack'
import { MessageSlot, slotMarker } from '#/components/message-slot'
import { PageTitle } from '#/components/page-title'
import { StatusIcon } from '#/components/status-icon'
import { signupEmail } from '#/fixtures/profile'
import { getMessages, useMessages } from '#/libraries/messages'
import { notWired } from '#/libraries/not-wired'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/verify-email')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_auth_verify_email() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <>
      <Stack gap={2}>
        <StatusIcon svg={Mail} />
        <PageTitle>{m.auth_verify_title()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>
          <MessageSlot
            message={m.auth_verify_subtitle({ email: slotMarker('email') })}
            name='email'
          >
            <span {...stylex.props(styles.strong)}>{signupEmail}</span>
          </MessageSlot>
        </p>
      </Stack>

      <Stack gap={3}>
        {/* Demo only: there is no mailer yet, so this stands in for opening the link. */}
        <Button render={<RouterLink to='/email-verified' />} size='large'>
          {m.auth_verify_done()}
        </Button>
        {/* Placeholder: resending needs the mailer. */}
        <Button variant='outline' size='large' onClick={notWired('Resend the verification email')}>
          {m.auth_verify_resend()}
        </Button>
      </Stack>

      <p {...stylex.props(styles.fine)}>
        <MessageSlot message={m.auth_verify_no_mail({ link: slotMarker('link') })} name='link'>
          <Link render={<RouterLink to='/signup' />} color='neutral' style={styles.link}>
            {m.auth_verify_other_email()}
          </Link>
        </MessageSlot>
      </p>
    </>
  )
}
