import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { unitLength, type UnitStep } from '../../styles/utils.stylex'
import { skeletonRadius, skeletonStyles as s } from './skeleton.stylex'

export interface SkeletonProps extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  /** A count of `unit` steps (`12` is 48px) or a CSS length (`'60%'`); unset leaves the width to the layout. */
  width?: UnitStep | (string & {})
  /** A count of `unit` steps or a CSS length; unset leaves the height to the layout. */
  height?: UnitStep | (string & {})
  /** A corner radius token; `medium` by default, `full` for an avatar. */
  borderRadius?: keyof typeof skeletonRadius
  style?: stylex.StyleXStyles
}

export function Skeleton({ width, height, borderRadius, style, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      {...stylex.props(
        s.root,
        borderRadius && skeletonRadius[borderRadius],
        width !== undefined && s.width(unitLength(width)),
        height !== undefined && s.height(unitLength(height)),
        style
      )}
    />
  )
}
