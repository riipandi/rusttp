/**
 * An easily stylable avatar component.
 *
 * @see: https://base-ui.com/react/components/avatar
 *
 * BaseUI Anatomy:
 * <Avatar.Root>
 *   <Avatar.Image />
 *   <Avatar.Fallback />
 * </Avatar.Root>
 */

import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import type { ColorRole, ControlSize, StyleProp } from '../../styles/types'
import { ring } from '../../styles/utils.stylex'
import { avatarFills, avatarStyles as s, avatarSizes as sizes } from './avatar.stylex'

export type AvatarSize = ControlSize
export type AvatarVariant = 'solid' | 'faded'
export type AvatarColor = ColorRole

type DivProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp

export function Avatar({
  size = 'medium',
  variant = 'faded',
  color = 'neutral',
  squared = false,
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAvatar.Root>, 'className' | 'style' | 'color'> &
  StyleProp & {
    size?: AvatarSize
    /** The fallback's fill: `faded` (a soft tint, default) or `solid`. */
    variant?: AvatarVariant
    /** The fallback's role color; `neutral` by default. */
    color?: AvatarColor
    /** Rounded corners instead of a circle. */
    squared?: boolean
  }) {
  return (
    <BaseAvatar.Root
      {...props}
      {...stylex.props(
        s.root,
        avatarFills[variant][color],
        sizes[size],
        squared && s.squared,
        style
      )}
    />
  )
}

export function AvatarImage({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAvatar.Image>, 'className' | 'style'> & StyleProp) {
  return <BaseAvatar.Image {...props} {...stylex.props(s.image, style)} />
}

export function AvatarFallback({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAvatar.Fallback>, 'className' | 'style'> & StyleProp) {
  return <BaseAvatar.Fallback {...props} {...stylex.props(s.fallback, style)} />
}

/** Status indicator anchored to the bottom-right corner of an `Avatar`. */
export function AvatarBadge({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.badge, style)} />
}

/**
 * Overlaps its `Avatar` (and `AvatarGroupCount`) children, each with a
 * `colors.backgroundPage` ring separating it from its neighbors. StyleX has no
 * sibling selectors, so each child is wrapped in a span carrying the
 * overlap + ring styles directly.
 */
export function AvatarGroup({ style, children, ...props }: DivProps) {
  const items = React.Children.toArray(children)
  return (
    <div {...props} {...stylex.props(s.group, style)}>
      {items.map((child, index) => (
        <span
          key={index}
          {...stylex.props(
            s.groupItem,
            index > 0 && s.groupItemOverlap,
            s.groupItemStack(items.length - index),
            ring({ width: stroke.ring2, color: colors.backgroundPage })
          )}
        >
          {child}
        </span>
      ))}
    </div>
  )
}

/** Trailing "+N" indicator for an `AvatarGroup`, sized to match `Avatar`. */
export function AvatarGroupCount({
  size = 'medium',
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp & { size?: AvatarSize }) {
  return <span {...props} {...stylex.props(s.groupCount, sizes[size], style)} />
}
