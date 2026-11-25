import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { unit } from '../../styles/tokens.stylex'

export const fieldStyles = stylex.create({
  set: {
    borderStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x4,
    margin: 0,
    minWidth: 0,
    padding: 0
  },
  legend: {
    fontWeight: fontWeight.medium,
    marginBottom: unit.x1_5,
    padding: 0
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x5,
    width: '100%'
  },
  field: {
    display: 'flex',
    fontFamily: fontFamily.body,
    gap: unit.x2,
    width: '100%'
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: unit.x0_5,
    lineHeight: fontLineHeight.body2
  },
  label: {
    width: 'fit-content'
  },
  title: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    width: 'fit-content'
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.body2,
    margin: 0,
    textAlign: 'start'
  },
  separator: {
    lineHeight: fontLineHeight.body2,
    height: unit.x5,
    marginBlock: `calc(-1 * ${unit.x2})`,
    position: 'relative'
  },
  separatorLine: {
    inset: 0,
    position: 'absolute',
    top: '50%'
  },
  separatorContent: {
    // Matches the Card surface: the separator lives inside a card, and the
    // content background must mask the line without clashing with it in
    // either theme.
    backgroundColor: colors.backgroundElevationBase,
    color: colors.foregroundNeutralFaded,
    display: 'block',
    marginInline: 'auto',
    paddingInline: unit.x2,
    position: 'relative',
    width: 'fit-content'
  },
  error: {
    color: colors.foregroundCritical,
    fontSize: fontSize.body2
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1,
    listStyle: 'disc',
    margin: 0,
    paddingInlineStart: unit.x4
  }
})

/**
 * The look of a form label, shared by `FieldLabel` and `Label`: compose `base`, then `invalid`
 * (critical while the label has `data-invalid`), after `type.body2`.
 */
export const fieldLabelStyles = stylex.create({
  base: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    userSelect: 'none'
  },
  invalid: {
    color: { default: null, '[data-invalid]': colors.foregroundCritical }
  }
})

export const fieldLegendKinds = stylex.create({
  legend: {
    fontSize: fontSize.body1
  },
  label: {
    fontSize: fontSize.body2
  }
})

export const fieldOrientations = stylex.create({
  vertical: {
    flexDirection: 'column'
  },
  horizontal: {
    alignItems: 'center',
    flexDirection: 'row'
  }
})
