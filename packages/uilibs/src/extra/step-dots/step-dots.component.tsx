import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { progressColors } from '../../base/progress/progress.stylex'
import type { ColorRole, PartProps } from '../../styles/types'
import { stepDotsMedia, stepDotsSizes as sizes, stepDotsStyles as s } from './step-dots.stylex'

export type StepDotsColor = ColorRole | 'media'
export type StepDotsSize = 'small' | 'medium'

/** Every string the indicator names. */
export interface StepDotsLabels {
  /** The name of the bar when the caller gives no `aria-label` or `aria-labelledby`. */
  name: string
  /** The spoken value, from one-based positions. */
  value: (current: number, total: number) => string
}

const defaultLabels: StepDotsLabels = {
  name: 'Progress',
  value: (current, total) => `${current} of ${total}`
}

/** Dots a long row shows at once. */
const WINDOW = 7
/** How many `unit` steps one dot and its gap take: 6 + 6px is 3 steps, 8 + 8px is 4. */
const stepUnits = { small: 3, medium: 4 } as const

export interface StepDotsProps extends PartProps<useRender.ComponentProps<'div'>, 'color'> {
  /** How many dots there are. A row longer than seven slides to keep the active dot in view. */
  total: number
  /** The index, from `0`, of the active dot. Default `0`. */
  activeIndex?: number
  /** The role of the active dot, as on `Progress`; `media` is white on a photo or a dark surface. Default `primary`. */
  color?: StepDotsColor
  /** Dot size: `small` 6px, `medium` 8px (default). */
  size?: StepDotsSize
  labels?: Partial<StepDotsLabels>
}

/**
 * A row of dots that shows where the user is in a sequence of steps or slides: a `progressbar`
 * whose value is the one-based position. It is output only; pair it with the control that moves.
 * Renders a `div`; `render` swaps it for another element.
 */
export function StepDots({
  total,
  activeIndex = 0,
  color = 'primary',
  size = 'medium',
  labels: labelsProp,
  style,
  render,
  ...props
}: StepDotsProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const count = Math.max(0, Math.floor(total))
  const active = Math.min(Math.max(Math.floor(activeIndex), 0), Math.max(count - 1, 0))
  const windowed = count > WINDOW
  const start = windowed
    ? Math.min(Math.max(active - Math.floor(WINDOW / 2), 0), count - WINDOW)
    : 0
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        role: 'progressbar',
        'aria-label': named ? undefined : labels.name,
        'aria-valuemin': 1,
        'aria-valuemax': count,
        'aria-valuenow': active + 1,
        'aria-valuetext': labels.value(active + 1, count),
        children:
          count > 0 ? (
            <div
              {...stylex.props(
                s.track,
                sizes[`${size}Track`],
                start > 0 && s.shift(-start * stepUnits[size])
              )}
            >
              {Array.from({ length: count }, (_, index) => (
                <div
                  key={index}
                  data-active={index === active ? '' : undefined}
                  {...stylex.props(
                    s.dot,
                    sizes[`${size}Dot`],
                    index === active && sizes[`${size}Active`],
                    color === 'media'
                      ? stepDotsMedia[index === active ? 'active' : 'idle']
                      : index === active && progressColors[color]
                  )}
                />
              ))}
            </div>
          ) : null
      },
      stylex.props(s.root, sizes[`${size}Root`], windowed && s.windowed, style),
      props
    ),
    render
  })
}
