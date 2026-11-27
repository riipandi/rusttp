import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { pressUntil } from '../contracts/keyboard'
import { ThemeSwitcher } from './theme-switcher'

const meta = {
  title: 'Extra Components/ThemeSwitcher',
  component: ThemeSwitcher
} satisfies Meta<typeof ThemeSwitcher>

type Story = StoryObj<typeof meta>

export default meta

const icons = ['light', 'dark', 'system'] as const

function iconOf(root: HTMLElement, name: (typeof icons)[number]) {
  const icon = root.querySelector(`[data-icon="${name}"]`)
  if (!(icon instanceof HTMLElement)) throw new Error(`No ${name} icon`)
  return icon
}

/** Every style rule inside a `prefers-reduced-motion` media query that applies to the element. */
function reducedMotionRules(element: Element) {
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

/** Each state's name is a `labels` entry, so the button speaks the page's language. */
export const Labels: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ThemeSwitcher
  labels={{
    toDark: 'Cast Nox',
    toSystem: 'Follow the castle',
    toLight: 'Cast Lumos'
  }}
/>`
      }
    }
  },
  render: () => (
    <ThemeSwitcher
      labels={{ toDark: 'Cast Nox', toSystem: 'Follow the castle', toLight: 'Cast Lumos' }}
    />
  ),
  play: async ({ canvas }) => {
    // The first state is `system`: the button names the theme a press switches to.
    const button = await canvas.findByRole('button', { name: 'Cast Lumos' })
    await userEvent.click(button)
    await canvas.findByRole('button', { name: 'Cast Nox' })
    await userEvent.click(canvas.getByRole('button', { name: 'Cast Nox' }))
    await canvas.findByRole('button', { name: 'Follow the castle' })
  }
}

/** A press switches to the next theme and names the one after it; its icon follows. */
export const Default: Story = {
  parameters: { docs: { source: { code: `<ThemeSwitcher />` } } },
  render: () => <ThemeSwitcher />,
  play: async ({ canvas, canvasElement }) => {
    // The cycle is light, dark, system. The first press leaves `system`.
    const steps = [
      ['Switch to light mode', 'system'],
      ['Switch to dark mode', 'light'],
      ['Switch to system mode', 'dark'],
      ['Switch to light mode', 'system']
    ] as const
    for (const [index, [name, icon]] of steps.entries()) {
      const button = await canvas.findByRole('button', { name })
      await expect(iconOf(button, icon)).toHaveAttribute('data-current')
      // Only the current icon shows once the transition has run.
      await waitFor(() => {
        const shown = icons.filter(
          (other) => getComputedStyle(iconOf(canvasElement, other)).opacity === '1'
        )
        if (shown.join() !== icon) throw new Error(`Shown icons: ${shown.join() || 'none'}`)
      })
      if (index < steps.length - 1) await userEvent.click(button)
    }
  }
}

/** The icons cross-fade and turn, and a user who asks for reduced motion gets the swap at once. */
export const Motion: Story = {
  parameters: { docs: { source: { code: `<ThemeSwitcher />` } } },
  render: () => <ThemeSwitcher />,
  play: async ({ canvasElement }) => {
    const icon = iconOf(canvasElement, 'system')
    const style = getComputedStyle(icon)
    await expect(style.transitionProperty).toContain('opacity')
    await expect(style.transitionProperty).toContain('transform')
    // The hidden icon is turned and shrunk; the shown one is upright (the identity matrix).
    await expect(style.transform).toBe('matrix(1, 0, 0, 1, 0, 0)')
    await expect(getComputedStyle(iconOf(canvasElement, 'light')).transform).not.toBe(
      'matrix(1, 0, 0, 1, 0, 0)'
    )

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await expect(style.transitionDuration).toBe(reduce ? '0s' : '0.2s')

    // Emulating the media feature is not possible from a play, so assert the shipped rule: under
    // `prefers-reduced-motion: reduce` the icon's transition lasts no time.
    const rules = reducedMotionRules(icon)
    await expect(rules.length).toBeGreaterThan(0)
    await expect(rules.some((rule) => rule.style.transitionDuration === '0s')).toBe(true)
  }
}

/** Tab reaches the button, and Enter and Space each switch to the next theme. */
export const Keyboard: Story = {
  render: () => <ThemeSwitcher />,
  play: async ({ canvas }) => {
    // The first state is `system`; the cycle is light, dark, system.
    const named = (name: string) => canvas.queryByRole('button', { name })
    const button = await canvas.findByRole('button', { name: 'Switch to light mode' })

    await pressUntil('{Tab}', () => expect(button).toHaveFocus(), {
      when: () => document.activeElement !== button
    })

    // Enter leaves `system` for light, and the button names the next step.
    await pressUntil('{Enter}', () => expect(named('Switch to dark mode')).toBeInTheDocument(), {
      when: () => !named('Switch to dark mode')
    })
    await expect(button).toHaveFocus()

    // Space does the same: light to dark.
    await pressUntil(' ', () => expect(named('Switch to system mode')).toBeInTheDocument(), {
      when: () => !named('Switch to system mode')
    })
    await expect(button).toHaveFocus()
  }
}
