import * as stylex from '@stylexjs/stylex'
import { colors } from '../styles/colors.stylex'
import {
  container,
  fontFamily,
  fontLineHeight,
  fontSize,
  radius,
  stroke,
  unit
} from '../styles/tokens.stylex'

// Tooltip follows the repo's elevated non-inverted card language (same
// surface as toast: overlay elevation + thin dimmed border, radius.medium).
// Legend and chrome text stay on `foregroundNeutral`. `minWidth` has no unit
// token — it mirrors shadcn's 8rem tooltip floor.

// Tooltip chrome follows the repo's elevated non-inverted card language (same
// surface as toast: overlay elevation + thin dimmed border, radius.medium),
// applied by redirecting the native surface's `--ts-chart-tooltip-*`
// variables. The native tooltip body provides its own internal layout.

const chartPaletteOverrides = {
  '--ts-chart-1': colors.foregroundPrimary,
  '--ts-chart-2': colors.foregroundPositive,
  '--ts-chart-3': colors.foregroundWarning,
  '--ts-chart-4': colors.foregroundCritical,
  '--chart-foreground': colors.foregroundNeutral,
  '--chart-muted': colors.foregroundNeutralFaded,
  '--chart-grid': colors.borderNeutralFaded
}

const chartTooltipOverrides = {
  '--ts-chart-tooltip-background': colors.backgroundElevationOverlay,
  '--ts-chart-tooltip-border': `${stroke.ring1} solid ${colors.borderNeutralFaded}`,
  '--ts-chart-tooltip-border-radius': radius.medium,
  '--ts-chart-tooltip-color': colors.foregroundNeutral,
  '--ts-chart-tooltip-font': `500 ${fontSize.caption1}/${fontLineHeight.caption1} ${fontFamily.body}`,
  '--ts-chart-tooltip-max-width': container.small,
  '--ts-chart-tooltip-padding': `${unit.x1_5} ${unit.x3}`,
  '--ts-chart-tooltip-shadow': 'none'
}

export const chartStyles = stylex.create({
  root: {
    alignItems: 'stretch',
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    gap: unit.x3,
    width: '100%'
  },
  chart: {
    ...chartPaletteOverrides,
    ...chartTooltipOverrides,
    outline: {
      default: 'none',
      ':has(svg:focus-visible)': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: stroke.ring2,
    width: '100%'
  },
  legend: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x4,
    justifyContent: 'center'
  },
  legendItem: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x1_5
  },
  legendSwatch: {
    borderRadius: radius.xsmall,
    display: 'block',
    flexShrink: 0,
    height: unit.x2,
    width: unit.x2
  }
})

/** The legend swatch fill per series color: one static rule for each name in `chartColors`. */
export const chartSwatchColors = stylex.create({
  chart1: { backgroundColor: colors.chart1 },
  chart2: { backgroundColor: colors.chart2 },
  chart3: { backgroundColor: colors.chart3 },
  chart4: { backgroundColor: colors.chart4 },
  chart5: { backgroundColor: colors.chart5 },
  chart6: { backgroundColor: colors.chart6 },
  chart7: { backgroundColor: colors.chart7 },
  chart8: { backgroundColor: colors.chart8 }
})
