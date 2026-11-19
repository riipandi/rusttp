import * as stylex from '@stylexjs/stylex'
import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Text } from 'uilibs/extra/text'
import { styles as layout } from '#/styles/element/layout.stylex'

export function GlobalNotFound() {
  return (
    <div {...stylex.props(layout.root)}>
      <main {...stylex.props(layout.center)}>
        <Text variant='featured-1'>404</Text>
        <Text color='neutral-faded'>Sorry, we couldn&rsquo;t find your page.</Text>
        <Link to='/'>Back to main page</Link>
      </main>
    </div>
  )
}

export function GlobalError({ error, reset }: ErrorComponentProps) {
  return (
    <div {...stylex.props(layout.root)}>
      <main {...stylex.props(layout.center)}>
        <Text variant='featured-1'>Something went wrong</Text>
        <Text color='neutral-faded'>
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </Text>
        <Button onClick={reset}>Try again</Button>
      </main>
    </div>
  )
}
