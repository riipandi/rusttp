import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { mapResponsive, type Responsive } from '../../hooks/use-responsive-value'
import type { UnitStep } from '../../styles/utils.stylex'
import { resolveResponsive, type ResponsiveSpec } from '../text/text.component'
import {
  stackAlign,
  stackAlignLarge,
  stackAlignMedium,
  stackAlignXLarge,
  stackDirection,
  stackDirectionLarge,
  stackDirectionMedium,
  stackDirectionXLarge,
  stackGap,
  stackGapLarge,
  stackGapMedium,
  stackGapXLarge,
  stackJustify,
  stackJustifyLarge,
  stackJustifyMedium,
  stackJustifyXLarge,
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

export interface StackProps extends Omit<useRender.ComponentProps<'div'>, 'className' | 'style'> {
  /** The main axis. Responsive. Default `column`. */
  direction?: Responsive<StackDirection>
  /** The space between children, in `unit` steps (`3` is 12px). Responsive. Default none. */
  gap?: Responsive<UnitStep>
  /** Alignment on the cross axis. Responsive. Default stretch, as in CSS. */
  align?: Responsive<StackAlign>
  /** Distribution on the main axis. Responsive. Default start, as in CSS. */
  justify?: Responsive<StackJustify>
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

const ALIGN_SPEC: ResponsiveSpec<StackAlign> = {
  small: stackAlign,
  medium: stackAlignMedium,
  large: stackAlignLarge,
  xlarge: stackAlignXLarge
}

const JUSTIFY_SPEC: ResponsiveSpec<StackJustify> = {
  small: stackJustify,
  medium: stackJustifyMedium,
  large: stackJustifyLarge,
  xlarge: stackJustifyXLarge
}

/**
 * A flex container that lays its children out in a row or a column. Direction, gap, alignment, and
 * justification take one value or one per breakpoint (`{ small: 'column', medium: 'row' }`),
 * compiled to static media styles, so the layout never waits for JavaScript. Renders a `div`;
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
        ...resolveResponsive(align, ALIGN_SPEC),
        ...resolveResponsive(justify, JUSTIFY_SPEC),
        wrap && s.wrap,
        style
      ),
      props
    )
  })
}
