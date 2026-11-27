import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { mapResponsive, type Responsive } from '../../hooks/use-responsive-value'
import type { PartProps } from '../../styles/types'
import { resolveResponsive, type ResponsiveSpec } from '../text/text.component'
import { hiddenLarge, hiddenMedium, hiddenRoot, hiddenSmall, hiddenXLarge } from './hidden.stylex'

export interface HiddenProps extends PartProps<useRender.ComponentProps<'div'>> {
  /** Hides the children: `true` for every viewport, or per breakpoint (`{ small: true, large: false }`). Unset shows them. */
  hide?: Responsive<boolean>
  style?: stylex.StyleXStyles
}

type Visibility = 'hide' | 'show'

const VISIBILITY_SPEC: ResponsiveSpec<Visibility> = {
  small: hiddenSmall,
  medium: hiddenMedium,
  large: hiddenLarge,
  xlarge: hiddenXLarge
}

/**
 * Shows or hides its children per breakpoint, with CSS media queries, so the first paint is already
 * right and nothing flashes. A shown `Hidden` is `display: contents`: it adds no box of its own. A
 * hidden one is `display: none`, which also removes the children from the accessibility tree.
 * Renders a `div`; `render` swaps the element.
 */
export function Hidden({ hide, style, render, ...props }: HiddenProps) {
  const visibility = mapResponsive(hide, (value): Visibility => (value ? 'hide' : 'show'))
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      stylex.props(hiddenRoot.root, ...resolveResponsive(visibility, VISIBILITY_SPEC), style),
      props
    )
  })
}
