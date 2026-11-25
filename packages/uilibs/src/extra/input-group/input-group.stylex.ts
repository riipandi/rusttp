import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontSize } from '../../styles/tokens.stylex'

export const inputGroupStyles = stylex.create({
  // The box and state model come from `controlBase.root` and `.within`; the
  // height is each control's own, so a block-aligned addon can grow the group.
  root: {
    alignItems: {
      default: 'center',
      ':has([data-align^="block"])': 'stretch'
    },
    display: 'flex',
    flexDirection: {
      default: 'row',
      ':has([data-align^="block"])': 'column'
    },
    minWidth: 0,
    position: 'relative',
    width: '100%'
  },
  addon: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    cursor: 'text',
    display: 'flex',
    fontSize: fontSize.body2,
    gap: unit.x2,
    justifyContent: 'center',
    paddingBlock: unit.x1,
    userSelect: 'none'
  },
  text: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    fontSize: fontSize.body2,
    gap: unit.x2
  },
  control: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    flex: 1,
    outline: 'none'
  },
  textarea: {
    paddingBlock: unit.x2,
    resize: 'none'
  }
})

/** An input fills the group's border box: the control height minus the two 1px borders. */
export const inputGroupControlHeights = stylex.create({
  small: { height: `calc(${unit.x8} - ${stroke.ring1} * 2)` },
  medium: { height: `calc(${unit.x9} - ${stroke.ring1} * 2)` },
  large: { height: `calc(${unit.x10} - ${stroke.ring1} * 2)` }
})

export const inputGroupAddonAligns = stylex.create({
  // An inline addon sits within the control's own height, so it adds no block padding.
  'inline-start': {
    order: -1,
    paddingBlock: 0,
    paddingInlineStart: unit.x2
  },
  'inline-end': {
    order: 9,
    paddingBlock: 0,
    paddingInlineEnd: unit.x2
  },
  'block-start': {
    justifyContent: 'flex-start',
    order: -1,
    paddingInline: unit.x3,
    paddingTop: unit.x2,
    width: '100%'
  },
  'block-end': {
    justifyContent: 'flex-start',
    order: 9,
    paddingBottom: unit.x2,
    paddingInline: unit.x3,
    width: '100%'
  }
})

export const inputGroupButtonSizes = stylex.create({
  xsmall: {
    borderRadius: radius.small,
    gap: unit.x1,
    height: unit.x6,
    paddingInline: unit.x1_5
  },
  small: {
    height: unit.x8
  }
})

// The square of an addon button with no children, composed after `inputGroupButtonSizes`.
export const inputGroupButtonSquare = stylex.create({
  xsmall: { paddingInline: 0, width: unit.x6 },
  small: { paddingInline: 0, width: unit.x8 }
})
