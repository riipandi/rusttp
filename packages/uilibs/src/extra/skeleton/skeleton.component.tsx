import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { PartProps } from '../../styles/types'
import { unitLength, type UnitStep } from '../../styles/utils.stylex'
import { skeletonRadius, skeletonStyles as s } from './skeleton.stylex'

export interface SkeletonProps extends PartProps<useRender.ComponentProps<'div'>> {
  /** A count of `unit` steps (`12` is 48px) or a CSS length (`'60%'`); unset leaves the width to the layout. */
  width?: UnitStep | (string & {})
  /** A count of `unit` steps or a CSS length; unset leaves the height to the layout. */
  height?: UnitStep | (string & {})
  /** A corner radius token; `medium` by default, `full` for an avatar. */
  borderRadius?: keyof typeof skeletonRadius
}

/** Renders a `div`; `render` swaps it for another element. */
export function Skeleton({ width, height, borderRadius, style, render, ...props }: SkeletonProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      stylex.props(
        s.root,
        borderRadius && skeletonRadius[borderRadius],
        width !== undefined && s.width(unitLength(width)),
        height !== undefined && s.height(unitLength(height)),
        style
      ),
      props
    ),
    render
  })
}
