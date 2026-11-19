import { Mail } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { LinkButton } from '#/components/link-button'
import { StatusIcon } from '#/components/status-icon'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/verify-email')({
  component: RouteComponent,
  staticData: { pageTitle: 'Verify your email' }
})

function RouteComponent() {
  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <StatusIcon svg={Mail} />
        <h1 {...stylex.props(styles.title)}>Check your email</h1>
        <p {...stylex.props(styles.subtitle)}>
          We sent a verification link to{' '}
          <span {...stylex.props(styles.strong)}>sophie.neveu@example.com</span>. Open it to finish
          creating your account.
        </p>
      </div>

      <div {...stylex.props(styles.actions)}>
        {/* Demo only: there is no mailer yet, so this stands in for opening the link. */}
        <LinkButton to='/email-verified' size='lg'>
          I have verified my email
        </LinkButton>
        {/* Placeholder: resending needs the mailer. */}
        <Button variant='outline' size='lg'>
          Resend the email
        </Button>
      </div>

      <p {...stylex.props(styles.fine)}>
        Nothing in your inbox? Check the spam folder, or{' '}
        <Link to='/signup' {...stylex.props(styles.link)}>
          use a different email
        </Link>
        .
      </p>
    </>
  )
}
