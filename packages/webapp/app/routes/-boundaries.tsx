import { CircleAlert, SearchX } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import type * as React from 'react'
import { Button } from 'uilibs/base/button'
import { Icon } from 'uilibs/extra/icon'
import { Text } from 'uilibs/extra/text'
import { ThemeProvider } from 'uilibs/theme'
import { useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'

function Boundary({
  icon,
  title,
  description,
  detail,
  children
}: {
  icon: typeof CircleAlert
  title: string
  description: string
  detail?: string
  children: React.ReactNode
}) {
  // The root route's error component replaces the whole root, providers included, so this page
  // brings its own: on a reload the theme script and the stored choice would otherwise never run
  // and the page would fall back to light. A parent provider, when there is one, wins.
  return (
    <ThemeProvider attribute='data-theme' defaultTheme='system'>
      <title>{`${title} - Rusttp`}</title>
      <div {...stylex.props(layout.root)}>
        <main {...stylex.props(layout.center)}>
          <Icon svg={icon} size={32} color='neutral-faded' />
          <Text variant='featured-3' weight='bold' render={<h1>{title}</h1>} />
          <Text color='neutral-faded'>{description}</Text>
          {detail && (
            <Text variant='caption-1' color='neutral-faded' monospace>
              {detail}
            </Text>
          )}
          <div {...stylex.props(layout.actions)}>{children}</div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export function GlobalNotFound() {
  const m = useMessages()
  const router = useRouter()

  return (
    <Boundary
      icon={SearchX}
      title={m.boundary_not_found_title()}
      description={m.boundary_not_found_description()}
    >
      <Button render={<Link to='/' />}>{m.boundary_back_home()}</Button>
      <Button variant='faded' color='neutral' onClick={() => router.history.back()}>
        {m.boundary_go_back()}
      </Button>
    </Boundary>
  )
}

export function GlobalError({ error, reset }: ErrorComponentProps) {
  const m = useMessages()
  return (
    <Boundary
      icon={CircleAlert}
      title={m.boundary_error_title()}
      description={m.boundary_error_description()}
      // The raw message is a developer aid, not copy for a visitor, so a production build omits it.
      detail={import.meta.env.DEV && error instanceof Error ? error.message : undefined}
    >
      <Button onClick={reset}>{m.boundary_try_again()}</Button>
      <Button render={<Link to='/' />} variant='faded' color='neutral'>
        {m.boundary_back_home()}
      </Button>
    </Boundary>
  )
}
