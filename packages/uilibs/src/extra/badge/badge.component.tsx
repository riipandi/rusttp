import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { focusRing } from '../../styles/utils.stylex'
import {
  badgeFadedColors,
  badgeGhostColors,
  badgeOutlineColors,
  badgeSolidColors,
  badgeStyles as s,
  badgeVariants as variants
} from './badge.stylex'

export type BadgeVariant = 'solid' | 'faded' | 'outline' | 'ghost'
export type BadgeColor = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'

export interface BadgeProps extends Omit<
  useRender.ComponentProps<'span'>,
  'className' | 'style' | 'color'
> {
  /** The fill: `solid`, `faded` (a soft tint), `outline` (an edge), or `ghost` (text only). */
  variant?: BadgeVariant
  /** The role. `primary` for `solid`, `neutral` for the other fills, by default. */
  color?: BadgeColor
  style?: stylex.StyleXStyles
}

const colorStyles = {
  solid: badgeSolidColors,
  faded: badgeFadedColors,
  outline: badgeOutlineColors,
  ghost: badgeGhostColors
}

export function Badge({ variant = 'solid', color, style, render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      stylex.props(
        focusRing.root,
        s.root,
        variants[variant],
        colorStyles[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')],
        style
      ),
      props
    ),
    render
  })
}
