import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { unit } from 'uilibs/styles/tokens.stylex'

// The not-found and error pages. They are in the entry chunk (the router needs them before any
// route loads), so they lay out with plain flex rather than `Stack`, which would join the entry
// load and push it over its budget (`just size`).
export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: unit.x4,
    padding: unit.x6
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x2,
    marginBlockStart: unit.x2
  }
})
