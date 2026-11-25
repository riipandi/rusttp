import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import type { StyleProp } from '../../styles/types'
import {
  badgeAnchorCorners as corners,
  badgeAnchorOverlaps as overlaps,
  badgeAnchorStyles as s
} from './badge-anchor.stylex'

/** A corner of the anchored element; `start` and `end` follow the writing direction. */
export type BadgeAnchorCorner = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'
/** `circular` sits the badge on the rim of a round element; `rectangular` on the corner of its box. */
export type BadgeAnchorOverlap = 'rectangular' | 'circular'

export interface BadgeAnchorProps
  extends Omit<React.ComponentProps<'span'>, 'className' | 'style'>, StyleProp {
  /** The badge to show, usually a `Badge`. */
  badge: React.ReactNode
  /** The corner the badge sits on. Default `top-end`. */
  corner?: BadgeAnchorCorner
  /** Default `rectangular`; use `circular` on a round `Avatar` or icon button. */
  overlap?: BadgeAnchorOverlap
}

const cornerStyles = {
  'top-end': corners.topEnd,
  'top-start': corners.topStart,
  'bottom-end': corners.bottomEnd,
  'bottom-start': corners.bottomStart
} as const

/**
 * Pins a badge to a corner of the element it wraps: a count on an icon button, a status dot on an
 * avatar. The badge is centered on the corner point and does not change the element's size.
 */
export function BadgeAnchor({
  badge,
  corner = 'top-end',
  overlap = 'rectangular',
  style,
  children,
  ...props
}: BadgeAnchorProps) {
  return (
    <span {...props} {...stylex.props(s.root, overlaps[overlap], style)}>
      {children}
      <span data-slot='badge-anchor-badge' {...stylex.props(s.badge, cornerStyles[corner])}>
        <span {...stylex.props(s.badgeBox)}>{badge}</span>
      </span>
    </span>
  )
}
