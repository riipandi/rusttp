import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { LinkButton } from 'uilibs/base/button'
import type { Tone } from 'uilibs/styles/tone'
import { m } from '#/paraglide/messages'
import { styles, tones } from '#/styles/element/announcement-bar.stylex'

interface AnnouncementBarProps {
  /** The color role of the strip; `primary` by default. */
  tone?: Tone
  /** The landmark's name, for assistive technology. */
  label?: string
  /** An optional call to action: `render` is the link element (`<Link to='…' />` or `<a href='…' />`). */
  action?: { label: string; render: React.ReactElement<React.ComponentProps<'a'>> }
  children: React.ReactNode
}

// A full-width strip above the header: a notice about the session (signed in as an administrator)
// or an announcement (a promotion, a maintenance window). It is a static landmark, not a live
// region: it is there on load, so a screen reader finds it instead of being interrupted by it.
export function AnnouncementBar({
  tone = 'primary',
  label = m.announcement_bar_label(),
  action,
  children
}: AnnouncementBarProps) {
  return (
    <aside aria-label={label} {...stylex.props(styles.root, tones[tone])}>
      <p {...stylex.props(styles.message)}>{children}</p>
      {action && (
        <LinkButton render={action.render} variant='ghost' size='xs' style={styles.action}>
          {action.label}
        </LinkButton>
      )}
    </aside>
  )
}
