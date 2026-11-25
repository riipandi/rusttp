/**
 * Design tokens for the Base UI + StyleX component set, based on Reshaped.
 *
 * Common props for component: color, variant, shape, size
 * Colors (default: neutral): primary|neutral|positive|warning|critical
 * Variants: solid|faded|outline|ghost
 * Shape: pill|rectangle|rounded
 * Size: xsmall|small|medium|large|xlarge
 *
 * @ref: https://www.reshaped.so/docs/getting-started/overview
 * @ref: https://madeui.com/docs/customization
 */

import * as stylex from '@stylexjs/stylex'

// -----------------------------------------------------------------------------
// Font variables and constants
// -----------------------------------------------------------------------------

export const fontFamily = stylex.defineVars({
  headline: '"Mona Sans Variable", system-ui, -apple-system, Roboto, Aptos, Helvetica, sans-serif',
  title: '"Mona Sans Variable", system-ui, -apple-system, Roboto, Aptos, Helvetica, sans-serif',
  body: '"Mona Sans Variable", system-ui, -apple-system, Roboto, Aptos, Helvetica, sans-serif',
  monospace: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
})

export const fontWeight = stylex.defineConsts({
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
})

export const fontFamilyVar = stylex.defineVars({
  headline1: fontFamily.headline,
  headline2: fontFamily.headline,
  headline3: fontFamily.headline,
  featured1: fontFamily.title,
  featured2: fontFamily.title,
  featured3: fontFamily.title,
  featured4: fontFamily.title,
  featured5: fontFamily.title,
  featured6: fontFamily.title,
  body1: fontFamily.body,
  body2: fontFamily.body,
  caption1: fontFamily.body,
  caption2: fontFamily.body
})

export const fontWeightVar = stylex.defineVars({
  headline1: fontWeight.bold,
  headline2: fontWeight.bold,
  headline3: fontWeight.bold,
  featured1: fontWeight.semibold,
  featured2: fontWeight.semibold,
  featured3: fontWeight.semibold,
  featured4: fontWeight.semibold,
  featured5: fontWeight.semibold,
  featured6: fontWeight.semibold,
  body1: fontWeight.regular,
  body2: fontWeight.regular,
  caption1: fontWeight.regular,
  caption2: fontWeight.regular
})

export const fontSize = stylex.defineVars({
  headline1: '5rem',
  headline2: '4rem',
  headline3: '3rem',
  featured1: '2.5rem',
  featured2: '2rem',
  featured3: '1.75rem',
  featured4: '1.5rem',
  featured5: '1.25rem',
  featured6: '1.125rem',
  body1: '1rem',
  body2: '0.875rem',
  caption1: '0.75rem',
  caption2: '0.625rem'
})

export const fontLineHeight = stylex.defineVars({
  headline1: '5.25rem',
  headline2: '4.25rem',
  headline3: '3.25rem',
  featured1: '2.75rem',
  featured2: '2.25rem',
  featured3: '2rem',
  featured4: '2rem',
  featured5: '1.75rem',
  featured6: '1.5rem',
  body1: '1.5rem',
  body2: '1.25rem',
  caption1: '1rem',
  caption2: '0.75rem'
})

export const fontLetterSpacing = stylex.defineVars({
  headline1: '-0.03em',
  headline2: '-0.025em',
  headline3: '-0.02em',
  featured1: 'normal',
  featured2: 'normal',
  featured3: 'normal',
  featured4: 'normal',
  featured5: 'normal',
  featured6: 'normal',
  body1: 'normal',
  body2: 'normal',
  caption1: 'normal',
  caption2: 'normal'
})

// -----------------------------------------------------------------------------
// Measurement variables and constants
// -----------------------------------------------------------------------------

export const unit = stylex.defineConsts({
  x0_5: '2px',
  x1: '4px',
  x1_5: '6px',
  x2: '8px',
  x3: '12px',
  x4: '16px',
  x5: '20px',
  x6: '24px',
  x7: '28px',
  x8: '32px',
  x9: '36px',
  x10: '40px',
  x12: '48px',
  x14: '56px',
  x16: '64px',
  x18: '72px',
  x20: '80px'
})

export const stroke = stylex.defineConsts({
  ring1: '1px',
  ring2: '2px',
  ring3: '3px'
})

// Container widths for popups, panels, and example layouts.
export const container = stylex.defineConsts({
  xxsmall: '10rem',
  xsmall: '16rem',
  small: '18rem',
  medium: '20rem',
  large: '24rem',
  xlarge: '28rem',
  xxlarge: '32rem'
})

export const radius = stylex.defineVars({
  xsmall: '4px',
  small: '6px',
  medium: '8px',
  large: '10px',
  xlarge: '12px',
  xxlarge: '16px',
  full: '999px',
  none: '0px'
})

/**
 * The stacking layers, low to high. Each is one decision, made here: a popover opened from a modal
 * sits above it, a toast above both, and a dragged item above everything. A component names its
 * layer and never writes a number. `popover` covers every positioned popup (menus, select, combobox,
 * tooltip) because any of them can open from inside a modal.
 */
export const zIndex = stylex.defineConsts({
  base: 0,
  raised: 10,
  sticky: 50,
  dropdown: 100,
  overlay: 200,
  modal: 210,
  popover: 300,
  toast: 400,
  dragOverlay: 500
})

/**
 * The widths the breakpoints start at, in px. `useMediaQuery` restates them: a hook runs at runtime
 * and cannot import compiled StyleX constants.
 */
export const viewport = stylex.defineConsts({
  medium: 660,
  large: 900,
  xlarge: 1280
})

/**
 * Mobile-first: each query applies from its width up, so a wider one stacks over the narrower ones.
 * The base style is the small one, so there is no `small` query; write the narrow case as `default`.
 */
export const breakpoints = stylex.defineConsts({
  medium: '@media (min-width: 660px)',
  large: '@media (min-width: 900px)',
  xlarge: '@media (min-width: 1280px)'
})

// -----------------------------------------------------------------------------
// Motion variables and constants
// -----------------------------------------------------------------------------

export const duration = stylex.defineVars({
  rapid: '100ms',
  fast: '150ms',
  medium: '200ms',
  slow: '300ms'
})

export const easing = stylex.defineVars({
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)'
})

/** Durations that are not themed: the loops (spinner, skeleton, loader text) and Command's entrance stagger. */
export const motionLoop = stylex.defineConsts({
  spin: '1s',
  spinSlow: '3s',
  pulse: '2s',
  shimmer: '2.5s',
  stagger: '40ms'
})
