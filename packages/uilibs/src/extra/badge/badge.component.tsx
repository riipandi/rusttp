import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { X } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { markSize } from '../../styles/glyph'
import type { ColorRole, ControlSize, Glyph } from '../../styles/types'
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
export type BadgeColor = ColorRole
export type BadgeSize = ControlSize

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
  icon?: Glyph
  /** A glyph after the label, before the dismiss button. */
  endIcon?: Glyph
  /** Fades the badge to show it is the current one, such as the hovered item of a list; Reshaped does the same. */
  highlighted?: boolean
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

export function Badge({
  variant = 'solid',
  color,
  size = 'md',
  rounded = true,
  icon: Icon,
  endIcon: EndIcon,
  highlighted = false,
  onDismiss,
  labels,
  children,
  style,
  render,
  ...props
}: BadgeProps) {
  const glyph = markSize[size]
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      stylex.props(
        focusRing.root,
        s.root,
        variants[variant],
        badgeSizes[size],
        !rounded && s.squared,
        highlighted && s.highlighted,
        colorStyles[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')],
        style
      ),
      {
        ...props,
        children: (
          <>
            {Icon ? <Icon size={glyph} aria-hidden /> : null}
            {children}
            {EndIcon ? <EndIcon size={glyph} aria-hidden /> : null}
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
