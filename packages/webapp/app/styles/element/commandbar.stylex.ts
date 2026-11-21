import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { duration, easing, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

// The command bar: the search-like trigger in the sidebar, the keycaps in a command row, and the
// keyboard-shortcuts panel (`routes/admin/-commandbar.tsx`).
export const styles = stylex.create({
  // A field that opens the bar: the icon, the word, and the shortcut at the far end. It fills the
  // sidebar's width and folds to the 40px icon button on the rail.
  trigger: {
    justifyContent: 'flex-start',
    width: '100%',
    gap: unit.x2,
    paddingInline: unit.x3,
    color: colors.foregroundNeutralFaded,
    fontWeight: fontWeight.regular
  },
  triggerRail: {
    justifyContent: 'center',
    paddingInline: 0
  },
  triggerLabel: {
    flex: 1,
    textAlign: 'start',
    overflow: 'hidden'
  },
  // The keycaps in the rail's tooltip sit a step after the word.
  tipKeys: {
    marginInlineStart: unit.x2
  },
  // The keycaps stay as quiet as the label until the user reaches for the modifier.
  triggerKeys: {
    flexShrink: 0,
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionTimingFunction: easing.standard
  },
  triggerKeysQuiet: {
    opacity: 0.6
  },
  itemKeys: {
    marginInlineStart: 'auto'
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'min(28rem, 70dvh)'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: unit.x2,
    flexShrink: 0,
    padding: unit.x2,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  panelTitle: {
    margin: 0,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium
  },
  panelList: {
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    padding: unit.x2
  },
  panelGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBlockEnd: unit.x2
  },
  panelGroupLabel: {
    margin: 0,
    paddingInline: unit.x2,
    paddingBlock: unit.x1_5,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: unit.x3,
    paddingBlock: unit.x1,
    paddingInline: unit.x2
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  rowName: {
    fontSize: fontSize.body2
  },
  rowHint: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  },
  rowKeys: {
    display: 'flex',
    alignItems: 'center',
    gap: unit.x1,
    flexShrink: 0
  },
  unbound: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  }
})
