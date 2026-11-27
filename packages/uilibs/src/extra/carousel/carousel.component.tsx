import { ChevronLeft, ChevronRight } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Button } from '../../base/button'
import type { PartProps } from '../../styles/types'
import { focusRing, unitLength, visuallyHidden, type UnitStep } from '../../styles/utils.stylex'
import { carouselStyles as s } from './carousel.stylex'

/** Every string the carousel renders or names. */
export interface CarouselLabels {
  /** The name of the carousel when the caller gives no `aria-label` or `aria-labelledby`. */
  name: string
  /** What a screen reader calls the container: `aria-roledescription`. */
  roleDescription: string
  /** What a screen reader calls one slide: `aria-roledescription`. */
  slideRoleDescription: string
  /** The name of the scrolling, focusable strip of slides. */
  slides: string
  /** The name of a slide, from its one-based position. */
  slide: (index: number, total: number) => string
  /** The name of the previous button. */
  previous: string
  /** The name of the next button. */
  next: string
  /** The polite announcement after the visible slides change, from one-based positions. */
  status: (first: number, last: number, total: number) => string
}

const defaultLabels: CarouselLabels = {
  name: 'Carousel',
  roleDescription: 'carousel',
  slideRoleDescription: 'slide',
  slides: 'Slides',
  slide: (index, total) => `${index} of ${total}`,
  previous: 'Previous slide',
  next: 'Next slide',
  status: (first, last, total) =>
    first === last ? `Slide ${first} of ${total}` : `Slides ${first} to ${last} of ${total}`
}

export interface CarouselProps extends PartProps<React.ComponentProps<'section'>, 'onChange'> {
  /** How many slides fit the strip at once; each slide is `1 / visibleItems` of its width, less the gaps. Default `1`. */
  visibleItems?: number
  /** The space between slides: a count of `unit` steps (`3` is 12px) or a CSS length. Default `3`. */
  gap?: UnitStep | (string & {})
  /** Shows the previous and next buttons over the strip. Keyboard and touch scrolling work without them. Default `true`. */
  showControls?: boolean
  /** Called with the index of the first visible slide whenever it changes, from a button, a key, a swipe, or a scroll. */
  onChange?: (index: number) => void
  labels?: Partial<CarouselLabels>
  style?: stylex.StyleXStyles
}

interface Position {
  /** The slide nearest the start edge of the strip. */
  index: number
  atStart: boolean
  atEnd: boolean
}

const motionBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

/**
 * A strip of slides that scrolls and snaps, after the WAI-ARIA carousel pattern: a named region
 * called a carousel, a group per slide named by its position, named previous and next buttons that
 * stay focusable at the ends, and a focusable strip that takes the arrow keys.
 *
 * Each child is one slide; a fragment counts as one.
 */
export function Carousel({
  visibleItems = 1,
  gap = 3,
  showControls = true,
  onChange,
  labels: labelsProp,
  style,
  children,
  ...props
}: CarouselProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const slides = React.Children.toArray(children)
  const total = slides.length
  const visible = Math.max(1, Math.floor(visibleItems))
  const gapLength = unitLength(gap)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<Position>({
    index: 0,
    atStart: true,
    atEnd: true
  })
  const [rtl, setRtl] = React.useState(false)
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  const reportedRef = React.useRef(0)

  // The slide whose start edge is nearest the strip's start edge, from rects, so it reads the same
  // in either direction. Half a slide of slack makes a swipe that stops mid-slide round to the
  // nearer one.
  const measure = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const edge = viewport.getBoundingClientRect()
    const isRtl = rtlOf(viewport)
    let index = 0
    for (const [at, slide] of Array.from(viewport.children).entries()) {
      const rect = slide.getBoundingClientRect()
      const offset = isRtl ? edge.right - rect.right : rect.left - edge.left
      index = at
      if (offset >= -rect.width / 2) break
    }
    const travelled = Math.abs(viewport.scrollLeft)
    const next = {
      index,
      atStart: travelled <= 1,
      atEnd: travelled + viewport.clientWidth >= viewport.scrollWidth - 1
    }
    setPosition((current) =>
      current.index === next.index &&
      current.atStart === next.atStart &&
      current.atEnd === next.atEnd
        ? current
        : next
    )
    if (reportedRef.current !== index) {
      reportedRef.current = index
      onChangeRef.current?.(index)
    }
  }, [])

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined
    setRtl(rtlOf(viewport))
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [measure, total, visible])

  const scrollToIndex = (target: number) => {
    const viewport = viewportRef.current
    const slide = viewport?.children[Math.min(Math.max(target, 0), total - 1)]
    if (!viewport || !slide) return
    const edge = viewport.getBoundingClientRect()
    const rect = slide.getBoundingClientRect()
    // Positive scrolls toward the right in both directions, so the slide's distance from the start
    // edge carries the direction.
    const distance = rtlOf(viewport) ? rect.right - edge.right : rect.left - edge.left
    viewport.scrollTo({ left: viewport.scrollLeft + distance, behavior: motionBehavior() })
  }

  const lastStart = Math.max(0, total - visible)
  const step = (direction: 1 | -1) =>
    scrollToIndex(Math.min(Math.max(position.index + direction * visible, 0), lastStart))

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // A focused control inside a slide keeps its own keys.
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    if (event.key === forward) step(1)
    else if (event.key === backward) step(-1)
    else if (event.key === 'Home') scrollToIndex(0)
    else if (event.key === 'End') scrollToIndex(lastStart)
    else return
    event.preventDefault()
  }

  const last = Math.min(total - 1, position.index + visible - 1)
  const PreviousIcon = rtl ? ChevronRight : ChevronLeft
  const NextIcon = rtl ? ChevronLeft : ChevronRight

  return (
    <section
      aria-label={props['aria-labelledby'] ? undefined : labels.name}
      {...props}
      aria-roledescription={labels.roleDescription}
      {...stylex.props(s.root, style)}
    >
      <div
        ref={viewportRef}
        role='group'
        aria-label={labels.slides}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a strip that scrolls must take focus, or a keyboard cannot reach the part off screen (axe scrollable-region-focusable)
        tabIndex={0}
        onKeyDown={onKeyDown}
        onScroll={measure}
        {...stylex.props(focusRing.root, s.viewport, s.gap(gapLength))}
      >
        {slides.map((slide, index) => (
          <div
            key={React.isValidElement(slide) ? slide.key : index}
            role='group'
            aria-roledescription={labels.slideRoleDescription}
            aria-label={labels.slide(index + 1, total)}
            {...stylex.props(
              s.slide,
              s.basis(`calc((100% - ${gapLength} * ${visible - 1}) / ${visible})`)
            )}
          >
            {slide}
          </div>
        ))}
      </div>
      {showControls ? (
        <div {...stylex.props(s.controls)}>
          <Button
            variant='outline'
            size='small'
            icon={PreviousIcon}
            aria-label={labels.previous}
            disabled={position.atStart}
            focusableWhenDisabled
            onClick={() => step(-1)}
          />
          <Button
            variant='outline'
            size='small'
            icon={NextIcon}
            aria-label={labels.next}
            disabled={position.atEnd}
            focusableWhenDisabled
            onClick={() => step(1)}
          />
        </div>
      ) : null}
      <div role='status' {...stylex.props(visuallyHidden.root)}>
        {total > 0 ? labels.status(position.index + 1, last + 1, total) : null}
      </div>
    </section>
  )
}

function rtlOf(element: Element) {
  return getComputedStyle(element).direction === 'rtl'
}
