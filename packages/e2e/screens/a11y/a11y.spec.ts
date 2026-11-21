import { expect, test } from '../../fixtures/test.ts'
import { axeViolations, horizontalOverflow } from '../../utils/axe.ts'
import { allRoutes } from '../../utils/routes.ts'

// Every page, at a phone and a desktop width, in both color schemes: no axe violation and nothing
// wider than the screen. This is the net that catches the class of defect a component story cannot
// (a six-slot code that overflows a column, a landmark missing from a layout, a name that leaves out
// its visible text). Chromium only: the rules do not depend on the engine, and the sweep is the
// longest run in the suite.
const widths = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 }
]

test.describe('accessibility sweep', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Rules are engine-independent')
  test.skip(({ isMobile }) => isMobile, 'The widths are set by the sweep itself')

  for (const { name, width, height } of widths) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test.describe(`${name}, ${colorScheme}`, () => {
        test.use({ viewport: { width, height }, colorScheme })

        for (const path of allRoutes) {
          test(path, async ({ page }) => {
            await page.goto(path)
            await page.waitForLoadState('networkidle')

            expect(await axeViolations(page)).toEqual([])
            expect(await horizontalOverflow(page)).toBe(0)
          })
        }
      })
    }
  }
})
