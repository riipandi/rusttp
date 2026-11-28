/**
 * Every style rule inside a `prefers-reduced-motion` media query that applies to the element.
 * A play cannot emulate the media feature, so a motion story asserts the shipped rule instead:
 * `reducedMotionRules(el).some((rule) => rule.style.transitionProperty === 'none')`.
 */
export function reducedMotionRules(element: Element) {
  const found: CSSStyleRule[] = []
  const walk = (rules: CSSRuleList, reduced: boolean) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (reduced && element.matches(rule.selectorText)) found.push(rule)
      } else if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, reduced || rule.conditionText.includes('prefers-reduced-motion'))
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, reduced)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false)
  return found
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
