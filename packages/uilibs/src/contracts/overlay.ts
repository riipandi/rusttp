import { expect, waitFor } from 'storybook/test'

/**
 * How long a wait for a popup, a drop animation, or an exit transition may take. A popup stays in
 * the page while it leaves (`data-ending-style`), and a loaded WebKit runner stretches a half
 * second transition past ten. It equals the preview's `asyncUtilTimeout`; it is named here so an
 * overlay wait states what it is waiting for.
 */
export const OVERLAY_TIMEOUT = 10_000

/** The assertion that `query` finds nothing: the settled check for `pressUntil` and `waitFor`. */
export const gone = (query: () => unknown) => () => expect(query()).toBeNull()

/** Waits for a popup to leave the page, whatever closed it (a click, `Escape`, `Enter`). */
export function untilGone(query: () => unknown) {
  return waitFor(gone(query), { timeout: OVERLAY_TIMEOUT })
}

/**
 * Waits until every element matching `selector` is fully opaque. A play that ends right after a
 * drag or a close must not hand the page to the a11y gate mid-fade: axe reads a half-faded item
 * as low-contrast text (dnd-kit's drop animation pins `opacity: 0.4`, then the items fade back in).
 */
export function untilOpaque(selector: string) {
  return waitFor(
    async () => {
      for (const element of document.querySelectorAll(selector)) {
        await expect(getComputedStyle(element).opacity).toBe('1')
      }
    },
    { timeout: OVERLAY_TIMEOUT }
  )
}

/** The text of the screen-reader announcement a keyboard drag makes. */
export const live = () => document.querySelector('[aria-live]')?.textContent ?? ''

/** Whether an item or column is lifted by a drag. */
export const lifted = () => document.querySelector('[data-dragging="true"]') !== null
