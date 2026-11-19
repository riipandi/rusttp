import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize } from '../../styles/tokens.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const buttonGroupStyles = stylex.create({
  root: {
    alignItems: 'stretch',
    display: 'flex',
    fontFamily: fontFamily.body,
    width: 'fit-content'
  },
  text: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutral,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    display: 'flex',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    paddingInline: unit.x2
  },
  separator: {
    alignSelf: 'stretch',
    backgroundColor: colors.borderNeutralFaded
  }
})

export const buttonGroupOrientations = stylex.create({
  horizontal: {
    flexDirection: 'row'
  },
  vertical: {
    flexDirection: 'column'
  }
})

// Corners only: which edge is shared is `buttonGroupEdges`.
export const buttonGroupJoined = stylex.create({
  'horizontal-first': {
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0
  },
  'horizontal-middle': {
    borderRadius: radius.none
  },
  'horizontal-last': {
    borderBottomLeftRadius: radius.none,
    borderTopLeftRadius: radius.none
  },
  'vertical-first': {
    borderBottomLeftRadius: radius.none,
    borderBottomRightRadius: radius.none
  },
  'vertical-middle': {
    borderRadius: radius.none
  },
  'vertical-last': {
    borderTopLeftRadius: radius.none,
    borderTopRightRadius: radius.none
  }
})

// The leading edge of every child after the first. `shared`: the child's own
// border is dropped so it does not double the neighbour's. `divider`: a child
// with no border (a filled Button) gets a hairline in the text color at low
// alpha, whatever `borderWidth` its variant sets.
const dividerColor = 'color-mix(in srgb, currentColor 30%, transparent)'

export const buttonGroupSharedEdges = stylex.create({
  horizontal: { borderLeftWidth: 0 },
  vertical: { borderTopWidth: 0 }
})

export const buttonGroupDividerEdges = stylex.create({
  horizontal: {
    borderLeftColor: dividerColor,
    borderLeftStyle: 'solid',
    borderLeftWidth: stroke.ring1
  },
  vertical: {
    borderTopColor: dividerColor,
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1
  }
})
