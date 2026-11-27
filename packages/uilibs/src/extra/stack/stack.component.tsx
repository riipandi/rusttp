import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { mapResponsive, type Responsive } from '../../hooks/use-responsive-value'
import type { PartProps } from '../../styles/types'
import type { UnitStep } from '../../styles/utils.stylex'
import { resolveResponsive, type ResponsiveSpec } from '../text/text.component'
import {
  stackAlign,
  stackDirection,
  stackDirectionLarge,
  stackDirectionMedium,
  stackDirectionXLarge,
  stackGap,
  stackGapLarge,
  stackGapMedium,
  stackGapXLarge,
  stackJustify,
  stackStyles as s
} from './stack.stylex'

export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

export interface StackProps extends PartProps<useRender.ComponentProps<'div'>> {
  /** The main axis. Responsive. Default `column`. */
  direction?: Responsive<StackDirection>
  /** The space between children, in `unit` steps (`3` is 12px). Responsive. Default none. */
  gap?: Responsive<UnitStep>
  /** Alignment on the cross axis. Default stretch, as in CSS. */
  align?: StackAlign
  /** Distribution on the main axis. Default start, as in CSS. */
  justify?: StackJustify
  /** Lets children flow onto another line when they do not fit. */
  wrap?: boolean
  style?: stylex.StyleXStyles
}

const DIRECTION_SPEC: ResponsiveSpec<StackDirection> = {
  small: stackDirection,
  medium: stackDirectionMedium,
  large: stackDirectionLarge,
  xlarge: stackDirectionXLarge
}

// The gap sets are keyed by the step as text (`'1.5'`), because a style key is always a string.
const GAP_SPEC: ResponsiveSpec<`${UnitStep}`> = {
  small: stackGap,
  medium: stackGapMedium,
  large: stackGapLarge,
  xlarge: stackGapXLarge
}

/**
 * A flex container that lays its children out in a row or a column. Direction and gap take one
 * value or one per breakpoint (`{ small: 'column', medium: 'row' }`), compiled to static media
 * styles, so the layout never waits for JavaScript. Alignment and justification are single values. Renders a `div`;
 * `render` swaps the element (`<Stack render={<ul />}>`).
 */
export function Stack({
  direction,
  gap,
  align,
  justify,
  wrap = false,
  style,
  render,
  ...props
}: StackProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      stylex.props(
        s.root,
        ...resolveResponsive(direction, DIRECTION_SPEC),
        ...resolveResponsive(
          mapResponsive(gap, (step) => `${step}` as const),
          GAP_SPEC
        ),
        align && stackAlign[align],
        justify && stackJustify[justify],
        wrap && s.wrap,
        style
      ),
      props
    )
  })
}
