import { Mail } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { StatusIcon } from '#/components/status-icon'
import { signupEmail } from '#/fixtures/profile'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/verify-email')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_auth_verify_email() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <StatusIcon svg={Mail} />
        <h1 {...stylex.props(styles.title)}>{m.auth_verify_title()}</h1>
        <p {...stylex.props(styles.subtitle)}>
          {m.auth_verify_subtitle_before()}{' '}
          <span {...stylex.props(styles.strong)}>{signupEmail}</span>
          {m.auth_verify_subtitle_after()}
        </p>
      </div>

      <div {...stylex.props(styles.actions)}>
        {/* Demo only: there is no mailer yet, so this stands in for opening the link. */}
        <LinkButton render={<Link to='/email-verified' />} size='lg'>
          {m.auth_verify_done()}
        </LinkButton>
        {/* Placeholder: resending needs the mailer. */}
        <Button variant='outline' size='lg'>
          {m.auth_verify_resend()}
        </Button>
      </div>

      <p {...stylex.props(styles.fine)}>
        {m.auth_verify_no_mail()}{' '}
        <Link to='/signup' {...stylex.props(styles.link)}>
          {m.auth_verify_other_email()}
        </Link>
        .
      </p>
    </>
  )
}
