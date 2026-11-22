import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// axe-core's browser bundle, injected into the page under test (`@axe-core/playwright` would add a
// dependency for what is one script and one call).
const source = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

/** One line per violation: the rule, how many nodes, and where the first is. */
export async function axeViolations(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: source })
  // Typed in the page, where `axe` is a global the injected script defines.
  return page.evaluate(async () => {
    const axe: {
      run: (context: Document) => Promise<{
        violations: { id: string; impact?: string | null; nodes: { target: unknown[] }[] }[]
      }>
    } = Reflect.get(window, 'axe')
    const { violations } = await axe.run(document)
    return violations.map(
      (violation) =>
        `${violation.id} (${violation.impact}) x${violation.nodes.length}: ${violation.nodes[0]?.target.join(' ')}`
    )
  })
}

/** How many pixels the page is wider than the window: zero unless something overflows sideways. */
export function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
}
