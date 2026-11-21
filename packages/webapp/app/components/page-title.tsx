import type * as React from 'react'
import { Text } from 'uilibs/extra/text'

/**
 * A page's `h1`: the library's `featured-2` heading, so every route titles itself the same way and
 * a change to the type scale reaches all of them.
 */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return <Text variant='featured-2' weight='bold' render={<h1>{children}</h1>} />
}
