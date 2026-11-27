/**
 * Shadcn-style chart primitives built on TanStack Charts and StyleX.
 *
 * Anatomy (mirrors the shadcn chart pattern):
 * <ChartContainer config={chartConfig}>
 *   <Chart definition={chartDefinition} ariaLabel='Visitors' height={260} />
 *   <ChartLegend />
 * </ChartContainer>
 *
 * The `definition` is a plain TanStack `defineChart()` value; series keys in
 * the `config` map to mark `id`s so tooltips and legends can resolve labels
 * and colors. A mark color is any CSS color, a theme token (`colors.foregroundPrimary`, a
 * `var()` string) included: TanStack paints it as an SVG presentation attribute, and a browser
 * resolves `var()` there (checked in Chromium, light and dark), so a series follows the theme.
 * A series that carries meaning needs 3:1 against the page (WCAG 1.4.11) or a second cue: a
 * label, a pattern, or a legend entry next to it.
 *
 * Assistive technology: a chart is one `role='img'` named by `ariaLabel`. `description` on the
 * container (or `ariaDescription` on a chart) adds the accessible description, and a chart with a
 * tooltip is one Tab stop that draws the library focus ring; a chart without one has no Tab stop.
 * For the values themselves, put a `Table` of the same rows next to the chart (see `charts.mdx`).
 *
 * SSR and multi-chart hygiene: keep `initialWidth` stable across server and
 * client, and give every chart in the same document an explicit `idPrefix` so
 * gradient and clip IDs cannot collide.
 *
 * @see: https://tanstack.com/charts/latest/docs/framework/react/adapter
 * @see: https://tanstack.com/charts/catalog/collections/shadcn
 * @see: https://ui.shadcn.com/docs/components/base/chart
 */

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { ChartValue } from '@tanstack/charts'
import { motion } from '@tanstack/charts/motion'
import { RendererChart as TanStackChart } from '@tanstack/charts/react/tooltip'
import type { ChartTooltipBodyRenderContext } from '@tanstack/charts/react/tooltip'
import type { RendererChartProps as TanStackRendererChartProps } from '@tanstack/charts/react/tooltip'
import * as React from 'react'
import type { PartProps, StyleProp } from '../styles/types'
import { type ChartColorName, chartColors } from './chart-colors'
import { chartStyles as s, chartSwatchColors as swatchColors } from './chart.stylex'

export interface ChartConfigItem {
  label?: React.ReactNode
  /** The series color, one of the palette (`chart1` to `chart8`); a theme-aware token, never a free color string. */
  color?: ChartColorName
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

/** Maps mark `id`s (or series keys) to presentation metadata. */
export type ChartConfig = Record<string, ChartConfigItem>

// Motion timing mirrors the core motion tokens — `duration.medium` ('200ms')
// and `easing.decelerate` ('cubic-bezier(0, 0, 0.2, 1)', approximated by the
// 'ease-out' preset) — because the motion driver needs plain numbers. The
// driver respects `prefers-reduced-motion` by default, matching how the
// popup recipe reduces its transitions to opacity. `resize: true` animates
// container resizes instead of snapping. Module scope keeps the renderer
// identity stable across renders (the motion renderer relies on stable keys
// for DOM identity and spring velocity).
const chartMotionRenderer = motion({
  initial: true,
  resize: true,
  transition: { type: 'tween', duration: 200, easing: 'ease-out' }
})

interface ChartContextValue {
  config: ChartConfig
  description?: string
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

export interface ChartContainerProps extends PartProps<useRender.ComponentProps<'div'>> {
  config: ChartConfig
  /** What the chart shows, in a sentence or two: the trend, the range, the outlier. Every chart inside takes it as its accessible description. */
  description?: string
}

export function ChartContainer({
  config,
  description,
  style,
  render,
  ...props
}: ChartContainerProps) {
  const value = React.useMemo(() => ({ config, description }), [config, description])
  return (
    <ChartContext.Provider value={value}>
      {useRender({
        defaultTagName: 'div',
        props: mergeProps<'div'>(stylex.props(s.root, style), props),
        render
      })}
    </ChartContext.Provider>
  )
}

interface ChartOwnProps<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue
> extends StyleProp {
  renderTooltipBody?: (
    context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>
  ) => React.ReactNode
}

export type ChartProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue
> = PartProps<
  TanStackRendererChartProps<TDatum, TXValue, TYValue>,
  'renderTooltipBody' | 'renderer'
> &
  ChartOwnProps<TDatum, TXValue, TYValue>

export function Chart<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue
>({
  ariaDescription,
  style,
  renderTooltipBody,
  tabIndex,
  onRender,
  ...props
}: ChartProps<TDatum, TXValue, TYValue>) {
  const context = React.useContext(ChartContext)

  // TanStack makes the svg a Tab stop unless `focus` or `keyboard` is off. A chart with no tooltip
  // has nothing to read at a point, so it gets no stop either; an explicit `tabIndex` wins.
  const interactive = Boolean(props.definition.tooltip)

  // Rich tooltip bodies stay opt-in via `renderTooltipBody`; the default is
  // the native body (title, per-series rows with swatches, locale formatting)
  // themed through the `--ts-chart-tooltip-*` variables on the host class.
  // TanStack puts `className` on the host div only, so the ring is drawn on the host while the
  // svg holds focus (`chart.stylex.ts`). The svg keeps the browser's own ring, a second one, and
  // nothing in StyleX reaches it, so it is switched off on the element TanStack hands back.
  const chartProps = stylex.props(s.chart, style)
  return (
    <TanStackChart
      {...props}
      ariaDescription={ariaDescription ?? context?.description}
      tabIndex={tabIndex ?? (interactive ? undefined : -1)}
      onRender={(rendered) => {
        if (rendered.surface.element instanceof SVGElement) {
          rendered.surface.element.style.outline = 'none'
        }
        onRender?.(rendered)
      }}
      renderer={chartMotionRenderer}
      renderTooltipBody={renderTooltipBody}
      className={chartProps.className}
      style={chartProps.style}
    />
  )
}

export interface ChartLegendProps extends PartProps<React.ComponentProps<'div'>> {
  config?: ChartConfig
  /** Config keys to skip, e.g. series hidden by an application toggle. */
  hide?: readonly string[]
}

/** Config-driven legend, rendered outside the chart surface. Returns null
 * when no config entry carries a color. No `useRender` here on purpose: the
 * component conditionally renders nothing, and hooks may not follow an early
 * return — the tooltip content swap happens through `renderTooltipBody`. */
export function ChartLegend({ config, hide, style, ...props }: ChartLegendProps) {
  const contextConfig = React.useContext(ChartContext)?.config
  const activeConfig = config ?? contextConfig ?? {}

  const entries = Object.entries(activeConfig).filter(
    ([key, item]) => Boolean(item.color) && !hide?.includes(key)
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <div {...mergeProps<'div'>(stylex.props(s.legend, style), props)}>
      {entries.map(([key, item]) => {
        const Icon = item.icon
        return (
          <div key={key} {...stylex.props(s.legendItem)}>
            {Icon ? (
              <Icon height={12} width={12} color={item.color && chartColors[item.color]} />
            ) : (
              <span {...stylex.props(s.legendSwatch, item.color && swatchColors[item.color])} />
            )}
            {item.label ?? key}
          </div>
        )
      })}
    </div>
  )
}
