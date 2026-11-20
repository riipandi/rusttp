import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { Tone } from '../../styles/tone'
import {
  badgeFadedTones,
  badgeGhostTones,
  badgeOutlineTones,
  badgeSolidTones,
  badgeStyles as s,
  badgeVariants as variants
} from './badge.stylex'

export type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

export interface BadgeProps extends Omit<useRender.ComponentProps<'span'>, 'className' | 'style'> {
  /** The shape: `primary` a solid fill, `secondary` a faded one, `outline` an edge, `ghost` text only. */
  variant?: BadgeVariant
  /** The color role. `primary` for the `primary` variant, `neutral` for the others, by default. */
  tone?: Tone
  style?: stylex.StyleXStyles
}

const toneStyles = {
  primary: badgeSolidTones,
  secondary: badgeFadedTones,
  outline: badgeOutlineTones,
  ghost: badgeGhostTones
}

export function Badge({ variant = 'primary', tone, style, render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      stylex.props(
        s.root,
        variants[variant],
        toneStyles[variant][tone ?? (variant === 'primary' ? 'primary' : 'neutral')],
        style
      ),
      props
    ),
    render
  })
}
