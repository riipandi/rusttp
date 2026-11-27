import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { PartProps } from '../../styles/types'
import { unitLength, type UnitStep } from '../../styles/utils.stylex'
import { containerSizes, containerStyles as s } from './container.stylex'

export type ContainerSize = keyof typeof containerSizes

const isContainerSize = (size: string): size is ContainerSize => size in containerSizes

export interface ContainerProps extends PartProps<useRender.ComponentProps<'div'>> {
  /** The widest the container grows: a `container` token (`xxsmall` to `xxlarge`, 10rem to 32rem) or a CSS length such as `'72rem'`. Unset fills the parent. */
  size?: ContainerSize | (string & {})
  /** Padding on every side: a count of `unit` steps (`4` is 16px) or a CSS length. Default none. */
  padding?: UnitStep | (string & {})
}

/**
 * A block that is at most `size` wide and centered in its parent: the column a page, a form, or a
 * section of text is laid out in. Renders a `div`; `render` swaps the element (`<main>`).
 */
export function Container({ size, padding, style, render, ...props }: ContainerProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      stylex.props(
        s.root,
        size !== undefined && (isContainerSize(size) ? containerSizes[size] : s.maxWidth(size)),
        padding !== undefined && s.padding(unitLength(padding)),
        style
      ),
      props
    )
  })
}
