import { CircleCheck } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LinkButton } from 'uilibs/base/button'
import { StatusIcon } from '#/components/status-icon'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/email-verified')({
  component: RouteComponent,
  staticData: { pageTitle: 'Email verified' }
})

function RouteComponent() {
  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <StatusIcon svg={CircleCheck} tone='positive' />
        <h1 {...stylex.props(styles.title)}>Email verified</h1>
        <p {...stylex.props(styles.subtitle)}>
          Your address is confirmed and your account is ready. Sign in to get started.
        </p>
      </div>

      <LinkButton render={<Link to='/login' />} size='lg'>
        Continue to sign in
      </LinkButton>
    </>
  )
}
