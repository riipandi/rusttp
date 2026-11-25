import * as stylex from '@stylexjs/stylex'
import { stroke, unit } from '../../styles/tokens.stylex'

export const carouselStyles = stylex.create({
  root: {
    minWidth: 0,
    // The visually hidden status is absolutely positioned: it stays inside the carousel.
    position: 'relative',
    width: '100%'
  },
  // The scroll container: the browser snaps slides to the start edge, so touch, trackpad, wheel,
  // and the buttons all land on a whole slide. The ring sits inside the box so a parent that
  // clips overflow cannot cut it.
  viewport: {
    display: 'flex',
    outlineOffset: `calc(-1 * ${stroke.ring2})`,
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
    scrollbarWidth: 'none',
    scrollSnapType: 'x mandatory',
    '::-webkit-scrollbar': { display: 'none' }
  },
  slide: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    scrollSnapAlign: 'start'
  },
  // A gap and a slide width depend on `gap` and `visibleItems`, known only at run time.
  gap: (value: string) => ({ gap: value }),
  basis: (value: string) => ({ flexBasis: value }),
  controls: {
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'flex-end',
    marginBlockStart: unit.x3
  }
})
