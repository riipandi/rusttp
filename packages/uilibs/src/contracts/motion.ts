import { expect } from 'storybook/test'

/** Every style rule inside a media query that mentions `query` (`prefers-reduced-motion`) and applies to the element. */
export function mediaRules(element: Element, query: string) {
  const found: CSSStyleRule[] = []
  const walk = (rules: CSSRuleList, inside: boolean) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (inside && element.matches(rule.selectorText)) found.push(rule)
      } else if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, inside || rule.conditionText.includes(query))
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, inside)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false)
  return found
}

/**
 * The opacity and transform an element settles on while it carries `attribute`
 * (`data-starting-style`, `data-ending-style`): Base UI holds them for one frame, too short to read
 * back, so the attribute is set by hand with transitions off and removed again.
 */
export function pose(element: HTMLElement, attribute: string) {
  const { transition } = element.style
  element.style.transition = 'none'
  element.setAttribute(attribute, '')
  const { opacity, transform } = getComputedStyle(element)
  element.removeAttribute(attribute)
  element.style.transition = transition
  return { opacity, transform }
}

/**
 * Asserts the press sink of a control: `:active` scales it to 98%, and reduced motion drops that.
 * A script cannot hold `:active` in every engine (a synthetic pointer event does not set it), so the
 * rules are read instead: each `:active` rule is matched with the pseudo-class taken out.
 */
export async function expectPressSink(element: Element) {
  const found = new Map<string, { transform: string; reduced: boolean }>()
  const walk = (rules: CSSRuleList, reduced: boolean) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (!rule.selectorText.includes(':active') || !rule.style.transform) continue
        if (element.matches(rule.selectorText.replaceAll(':active', ''))) {
          found.set(`${reduced}:${rule.style.transform}`, {
            transform: rule.style.transform,
            reduced
          })
        }
      } else if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, reduced || rule.conditionText.includes('prefers-reduced-motion'))
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, reduced)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false)
  await expect([...found.values()]).toEqual([
    { transform: 'scale(0.98)', reduced: false },
    { transform: 'none', reduced: true }
  ])
}

/**
 * Each transition of `property` (CSS name, such as `opacity`) that starts under `root`, with the
 * value read as it starts: `0` for a fade-in. Call it before the action that triggers the change.
 */
export function watchTransitions(root: HTMLElement, property: string) {
  const runs: { target: Element; value: string }[] = []
  root.addEventListener('transitionrun', (event) => {
    if (event.propertyName !== property || !(event.target instanceof Element)) return
    runs.push({
      target: event.target,
      value: getComputedStyle(event.target).getPropertyValue(property)
    })
  })
  return runs
}
