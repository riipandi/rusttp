import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const alertStyles = stylex.create({
  root: {
    backgroundColor: colors.backgroundElevationBase,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.large,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x1,
    padding: unit.x4,
    position: 'relative',
    width: '100%'
  },
  title: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    lineHeight: fontLineHeight.body2,
    margin: 0
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    marginTop: unit.x1,
    margin: 0
  },
  action: {
    insetBlockStart: unit.x4,
    insetInlineEnd: unit.x4,
    position: 'absolute'
  },
  // With a glyph or `inline` the notice is a row: the glyph, then the text stacked in `content`.
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: unit.x3
  },
  // `inline` puts the action on the row with the text, and wraps it under the text when the notice
  // is too narrow for both: the text keeps a basis of 16rem.
  inline: {
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  glyph: {
    flexShrink: 0
  },
  content: {
    display: 'flex',
    flexBasis: 0,
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    gap: unit.x1,
    minWidth: 0
  },
  contentInline: {
    flexBasis: '16rem'
  },
  actionInline: {
    flexShrink: 0,
    marginInlineStart: 'auto',
    position: 'static'
  },
  // `bleed` runs the notice out past its parent's padding to the edges, so it drops the side edges
  // and the corners; the margin is set by `bleedBy`.
  bleed: {
    borderInlineEndWidth: 0,
    borderInlineStartWidth: 0,
    borderRadius: 0,
    width: 'auto'
  },
  bleedBy: (margin: string) => ({ marginInline: margin })
})

export const alertColors = stylex.create({
  neutral: {},
  primary: {
    borderColor: colors.borderPrimary,
    color: colors.foregroundPrimary
  },
  positive: {
    borderColor: colors.borderPositive,
    color: colors.foregroundPositive
  },
  warning: {
    borderColor: colors.borderWarning,
    color: colors.foregroundWarning
  },
  critical: {
    borderColor: colors.borderCritical,
    color: colors.foregroundCritical
  }
})
