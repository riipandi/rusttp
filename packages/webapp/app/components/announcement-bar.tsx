import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { LinkButton } from 'uilibs/base/button'
import { useMessages } from '#/libraries/messages'
import { barColors, styles } from '#/styles/element/announcement-bar.stylex'

type BarColor = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'

interface AnnouncementBarProps {
  /** The color role of the strip; `primary` by default. */
  color?: BarColor
  /** The landmark's name, for assistive technology. */
  label?: string
  /** An optional call to action: `render` is the link element (`<Link to='…' />` or `<a href='…' />`). */
  action?: { label: string; render: React.ReactElement<React.ComponentProps<'a'>> }
  /** Layout styles from the page, merged last (the admin layout pins the strip). */
  style?: stylex.StyleXStyles
  children: React.ReactNode
}

// A full-width strip above the header: a notice about the session (signed in as an administrator)
// or an announcement (a promotion, a maintenance window). It is a static landmark, not a live
// region: it is there on load, so a screen reader finds it instead of being interrupted by it.
export function AnnouncementBar({
  color = 'primary',
  label,
  action,
  style,
  children
}: AnnouncementBarProps) {
  const m = useMessages()
  return (
    <aside
      aria-label={label ?? m.announcement_bar_label()}
      {...stylex.props(styles.root, barColors[color], style)}
    >
      <p {...stylex.props(styles.message)}>{children}</p>
      {action && (
        <LinkButton render={action.render} variant='ghost' size='xs' style={styles.action}>
          {action.label}
        </LinkButton>
      )}
    </aside>
  )
}
