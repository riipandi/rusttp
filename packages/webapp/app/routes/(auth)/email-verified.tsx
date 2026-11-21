import { CircleCheck } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LinkButton } from 'uilibs/base/button'
import { StatusIcon } from '#/components/status-icon'
import { m } from '#/paraglide/messages'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/email-verified')({
  component: RouteComponent,
  staticData: { pageTitle: m.page_auth_email_verified }
})

function RouteComponent() {
  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <StatusIcon svg={CircleCheck} tone='positive' />
        <h1 {...stylex.props(styles.title)}>{m.page_auth_email_verified()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.auth_verified_subtitle()}</p>
      </div>

      <LinkButton render={<Link to='/login' />} size='lg'>
        {m.auth_verified_action()}
      </LinkButton>
    </>
  )
}
