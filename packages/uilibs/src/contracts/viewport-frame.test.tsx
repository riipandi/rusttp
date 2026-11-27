import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { ViewportFrame } from './viewport-frame'

// The dev server rewrites this element's text when a module changes; the frame must follow.
const DEV_SHEET_ID = '__stylex_virtual__'

describe('ViewportFrame', () => {
  it('copies the dev stylesheet again when the page changes it', async () => {
    // The test page already has the dev server's sheet: change that one, as the server does, and put
    // it back after.
    const existing = document.getElementById(DEV_SHEET_ID)
    const sheet = existing ?? document.createElement('style')
    const original = sheet.textContent
    sheet.id = DEV_SHEET_ID
    sheet.textContent = '.owl{color:red}'
    if (!existing) document.head.append(sheet)
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    try {
      root.render(
        <ViewportFrame width={390} title='Hogwarts'>
          Hedwig
        </ViewportFrame>
      )
      const copy = () =>
        host.querySelector('iframe')?.contentDocument?.getElementById(DEV_SHEET_ID)?.textContent
      await expect.poll(copy).toBe('.owl{color:red}')

      sheet.textContent = '.owl{color:blue}'
      await expect.poll(copy).toBe('.owl{color:blue}')
      // The frame holds one copy, not one per change.
      const frame = host.querySelector('iframe')?.contentDocument
      expect(frame?.querySelectorAll(`#${DEV_SHEET_ID}`)).toHaveLength(1)
    } finally {
      root.unmount()
      host.remove()
      if (existing) sheet.textContent = original
      else sheet.remove()
    }
  })
})
