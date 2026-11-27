import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { waitFor } from 'storybook/test'

const styles = stylex.create({
  // A frame wider than the canvas scrolls inside its own box instead of widening the page.
  scroll: { maxWidth: '100%', overflowX: 'auto' },
  frame: { backgroundColor: 'transparent', borderStyle: 'none', display: 'block' }
})

const BLANK = '<!doctype html><html><head></head><body style="margin:0"></body></html>'

const COPY_MARK = 'data-viewport-copy'

/** Replaces the frame's copy of the page's stylesheets with the page's current ones. */
function copyStyles(frame: Document) {
  for (const old of frame.head.querySelectorAll(`[${COPY_MARK}]`)) old.remove()
  for (const sheet of document.head.querySelectorAll('style, link[rel="stylesheet"]')) {
    const copy = frame.importNode(sheet, true)
    copy.setAttribute(COPY_MARK, '')
    frame.head.appendChild(copy)
  }
}

/**
 * Renders its children in an `iframe` of a fixed width, so a media query sees that width and not the
 * canvas's: the way a story shows, and a `play` asserts, one layout per breakpoint (390 px a phone,
 * 1000 px a desktop) in any browser and without resizing the test window. The page's stylesheets and
 * theme attributes are copied in, so the children are styled as they are outside the frame.
 */
export function ViewportFrame({
  width,
  height = 160,
  title,
  children
}: {
  width: number
  height?: number
  title: string
  children: React.ReactNode
}) {
  const [frame, setFrame] = React.useState<Document | null>(null)

  // The styles are copied before the children render, so a `play` that reads the frame the moment
  // its content exists never measures an unstyled page (a copy made in an effect came a frame late).
  const onLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const doc = event.currentTarget.contentDocument
    if (!doc) return
    for (const { name, value } of document.documentElement.attributes) {
      doc.documentElement.setAttribute(name, value)
    }
    copyStyles(doc)
    setFrame(doc)
  }

  // The dev server rewrites the StyleX sheet's text when a module changes, so a copy taken once
  // goes stale: copy again on every change to the page's styles.
  React.useEffect(() => {
    if (!frame) return undefined
    const observer = new MutationObserver(() => copyStyles(frame))
    observer.observe(document.head, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [frame])

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a box that scrolls must take focus, or a keyboard cannot reach the part off screen
    <div {...stylex.props(styles.scroll)} aria-label={title} role='region' tabIndex={0}>
      <iframe
        sandbox='allow-same-origin'
        {...stylex.props(styles.frame)}
        data-viewport={width}
        height={height}
        onLoad={onLoad}
        srcDoc={BLANK}
        title={title}
        width={width}
      >
        {frame && createPortal(children, frame.body)}
      </iframe>
    </div>
  )
}

/** The frame's document and window once its content has rendered: a `play` reads computed styles from them. */
export async function frameOf(canvasElement: HTMLElement, width: number) {
  const iframe = canvasElement.querySelector<HTMLIFrameElement>(`iframe[data-viewport="${width}"]`)
  if (!iframe) throw new Error(`No ViewportFrame of width ${width}`)
  // Four frames load one after another, and a full WebKit run can be slow: the 10 s default covers it.
  await waitFor(() => {
    if (!iframe.contentDocument?.body.firstElementChild)
      throw new Error('The frame has not rendered')
  })
  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) throw new Error(`The ViewportFrame of width ${width} has no document`)
  return { doc, win, computed: (element: Element) => win.getComputedStyle(element) }
}
