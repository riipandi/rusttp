import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { Responsive } from '../../hooks/use-responsive-value'
import type { PartProps } from '../../styles/types'
import {
  textAlignStyles,
  textColorStyles,
  textStyles,
  textVariantStyles,
  textVariantStylesLarge,
  textVariantStylesMedium,
  textVariantStylesXLarge,
  textWeightStyles
} from './text.stylex'

export type TextVariant =
  | 'headline-1'
  | 'headline-2'
  | 'headline-3'
  | 'featured-1'
  | 'featured-2'
  | 'featured-3'
  | 'featured-4'
  | 'featured-5'
  | 'featured-6'
  | 'body-1'
  | 'body-2'
  | 'caption-1'
  | 'caption-2'

export type TextColor =
  | 'neutral'
  | 'neutral-faded'
  | 'positive'
  | 'warning'
  | 'critical'
  | 'primary'
  | 'disabled'

export type TextWeight =
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'

export type TextAlign = 'start' | 'center' | 'end'

export type { Responsive }

// `CompiledStyles` accepts every `stylex.create()` output, including the
// media-query variants that plain `StyleXStyles` rejects.
type BreakpointStyles<T extends string> = Record<T, stylex.CompiledStyles>

export interface ResponsiveSpec<T extends string> {
  small: BreakpointStyles<T>
  medium: BreakpointStyles<T>
  large: BreakpointStyles<T>
  xlarge: BreakpointStyles<T>
}

const VARIANT_SPEC: ResponsiveSpec<TextVariant> = {
  small: textVariantStyles,
  medium: textVariantStylesMedium,
  large: textVariantStylesLarge,
  xlarge: textVariantStylesXLarge
}

// Featured variants render as headings by default, like Reshaped.
const TAG_MAP: Partial<Record<TextVariant, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>> = {
  'featured-1': 'h1',
  'featured-2': 'h2',
  'featured-3': 'h3',
  'featured-4': 'h4',
  'featured-5': 'h5',
  'featured-6': 'h6'
}

/**
 * Resolves a mobile-first responsive value into a cascade of styles. `small` is the base style (all
 * viewports); `medium`, `large`, and `xlarge` each apply from their width up, so a breakpoint emits a style only
 * when its value differs from the one below it (an omitted key inherits the nearest smaller one).
 * Going back to an earlier value counts as a change: `{ small: 'a', medium: 'b', large: 'a' }` emits at `large` too.
 */
export function resolveResponsive<T extends string>(
  value: Responsive<T> | undefined,
  spec: ResponsiveSpec<T>
): stylex.CompiledStyles[] {
  if (value === undefined) return []
  if (typeof value === 'string') return [spec.small[value]]

  const out: stylex.CompiledStyles[] = []
  let current = value.small
  if (current !== undefined) out.push(spec.small[current])

  for (const key of ['medium', 'large', 'xlarge'] as const) {
    const next = value[key]
    if (next === undefined || next === current) continue
    out.push(spec[key][next])
    current = next
  }
  return out
}

export interface TextProps extends PartProps<useRender.ComponentProps<'div'>> {
  variant?: Responsive<TextVariant>
  color?: TextColor
  weight?: TextWeight
  align?: TextAlign
  decoration?: 'underline' | 'line-through'
  maxLines?: number
  wrap?: 'balance' | 'nowrap'
  monospace?: boolean
  numeric?: boolean
  style?: stylex.StyleXStyles
}

export function Text({
  variant = 'body-1',
  color,
  weight,
  align,
  decoration,
  maxLines,
  wrap,
  monospace = false,
  numeric = false,
  style,
  render,
  ...props
}: TextProps) {
  const largestVariant =
    typeof variant === 'string'
      ? variant
      : (variant.xlarge ?? variant.large ?? variant.medium ?? variant.small)
  const defaultTagName = (largestVariant && TAG_MAP[largestVariant]) || 'div'

  return useRender({
    defaultTagName,
    render,
    props: mergeProps<'div'>(
      stylex.props(
        // Variant first so weight/color overrides win the cascade.
        ...resolveResponsive(variant, VARIANT_SPEC),
        color && textColorStyles[color],
        weight && textWeightStyles[weight],
        align && textAlignStyles[align],
        decoration === 'underline' && textStyles.decorationUnderline,
        decoration === 'line-through' && textStyles.decorationLineThrough,
        wrap === 'balance' && textStyles.wrapBalance,
        wrap === 'nowrap' && textStyles.wrapNowrap,
        monospace && textStyles.monospace,
        numeric && textStyles.numeric,
        maxLines !== undefined && textStyles.clamp(maxLines),
        maxLines === 1 && textStyles.breakAll,
        style
      ),
      props
    )
  })
}
