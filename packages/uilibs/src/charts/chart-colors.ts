import { colors } from '../styles/colors.stylex'

/**
 * The categorical series palette, in the order a chart assigns it. A chart series takes one of
 * these (never a free color string), so every series follows the theme and holds 3:1 against the page.
 */
export const chartColors = {
  chart1: colors.chart1,
  chart2: colors.chart2,
  chart3: colors.chart3,
  chart4: colors.chart4,
  chart5: colors.chart5,
  chart6: colors.chart6,
  chart7: colors.chart7,
  chart8: colors.chart8
} as const

export type ChartColorName = keyof typeof chartColors
