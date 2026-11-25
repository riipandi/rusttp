import * as stylex from '@stylexjs/stylex'
import { stroke } from '../../styles/tokens.stylex'
import { radius } from '../../styles/tokens.stylex'

// What a member of a `ButtonGroup` changes about its own box, by position. Button, Input, Select,
// and InputGroup compose these through `buttonGroupMember` (`button-group.context.ts`).

// Corners only: which edge is shared is `buttonGroupSharedEdges` or `buttonGroupDividerEdges`.
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

// The leading edge of every member after the first. `shared`: the member's own border is dropped
// so it does not double the neighbour's. `divider`: a member with no border (a filled Button) gets
// a hairline in the text color at low alpha, whatever `borderWidth` its variant sets.
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
