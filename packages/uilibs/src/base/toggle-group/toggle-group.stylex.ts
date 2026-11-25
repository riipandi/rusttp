import * as stylex from '@stylexjs/stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const toggleGroupStyles = stylex.create({
  root: {
    display: 'flex',
    width: 'fit-content'
  },
  gap: {
    gap: unit.x2
  },
  item: {
    flexShrink: 0
  }
})

export const toggleGroupOrientations = stylex.create({
  horizontal: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  vertical: {
    alignItems: 'stretch',
    flexDirection: 'column'
  }
})

export const toggleGroupJoinedItems = stylex.create({
  horizontal: {
    borderEndStartRadius: { default: 0, ':first-child': radius.large },
    borderEndEndRadius: { default: 0, ':last-child': radius.large },
    borderStartStartRadius: { default: 0, ':first-child': radius.large },
    borderStartEndRadius: { default: 0, ':last-child': radius.large },
    paddingInline: unit.x2
  },
  vertical: {
    borderEndStartRadius: { default: 0, ':last-child': radius.large },
    borderEndEndRadius: { default: 0, ':last-child': radius.large },
    borderStartStartRadius: { default: 0, ':first-child': radius.large },
    borderStartEndRadius: { default: 0, ':first-child': radius.large },
    paddingInline: unit.x2
  }
})

// Joined outline items share edges — drop the leading border on every item
// but the first so adjacent borders don't double up.
export const toggleGroupJoinedOutline = stylex.create({
  horizontal: {
    borderInlineStartWidth: { default: 0, ':first-child': stroke.ring1 }
  },
  vertical: {
    borderTopWidth: { default: 0, ':first-child': stroke.ring1 }
  }
})
