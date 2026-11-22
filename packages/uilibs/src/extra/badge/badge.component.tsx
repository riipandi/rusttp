import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { X } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { focusRing } from '../../styles/utils.stylex'
import {
  badgeFadedColors,
  badgeGhostColors,
  badgeOutlineColors,
  badgeSizes,
  badgeSolidColors,
  badgeStyles as s,
  badgeVariants as variants
} from './badge.stylex'

export type BadgeVariant = 'solid' | 'faded' | 'outline' | 'ghost'
export type BadgeColor = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'
export type BadgeSize = 'sm' | 'md' | 'lg'

/** A glyph component, such as a Keyline icon; the badge sizes it and hides it from assistive technology. */
export type BadgeGlyph = React.ComponentType<{ size?: number | string; 'aria-hidden'?: boolean }>

export interface BadgeLabels {
  /** Name of the dismiss button. Defaults to `Dismiss`. */
  dismiss: string
}

export interface BadgeProps extends Omit<
  useRender.ComponentProps<'span'>,
  'className' | 'style' | 'color'
> {
  /** The fill: `solid`, `faded` (a soft tint), `outline` (an edge), or `ghost` (text only). */
  variant?: BadgeVariant
  /** The role. `primary` for `solid`, `neutral` for the other fills, by default. */
  color?: BadgeColor
  size?: BadgeSize
  /** A pill by default; `false` gives the squarer corners. */
  rounded?: boolean
  /** A glyph before the label. */
  icon?: BadgeGlyph
  /**
   * Adds a trailing dismiss button that calls this. Do not combine it with a link `render`:
   * a button cannot sit inside a link.
   */
  onDismiss?: () => void
  /** The dismiss button's name; English by default. */
  labels?: Partial<BadgeLabels>
  style?: stylex.StyleXStyles
}

const colorStyles = {
  solid: badgeSolidColors,
  faded: badgeFadedColors,
  outline: badgeOutlineColors,
  ghost: badgeGhostColors
}

const glyphSize = { sm: 10, md: 12, lg: 14 } as const

export function Badge({
  variant = 'solid',
  color,
  size = 'md',
  rounded = true,
  icon: Icon,
  onDismiss,
  labels,
  children,
  style,
  render,
  ...props
}: BadgeProps) {
  const glyph = glyphSize[size]
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      stylex.props(
        focusRing.root,
        s.root,
        variants[variant],
        badgeSizes[size],
        !rounded && s.squared,
        colorStyles[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')],
        style
      ),
      {
        ...props,
        children: (
          <>
            {Icon ? <Icon size={glyph} aria-hidden /> : null}
            {children}
            {onDismiss ? (
              <button
                type='button'
                aria-label={{ dismiss: 'Dismiss', ...labels }.dismiss}
                onClick={onDismiss}
                {...stylex.props(focusRing.root, s.dismiss)}
              >
                <X size={glyph} strokeWidth={1.5} aria-hidden />
              </button>
            ) : null}
          </>
        )
      }
    ),
    render
  })
}
