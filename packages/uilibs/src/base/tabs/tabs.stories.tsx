import { Bell as BellIcon, User } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  cellOf,
  denseControlHeights,
  denseControlSizeNames,
  expectControlHeights
} from '../../contracts/control-sizes'
import { expectHitArea } from '../../contracts/hit-area'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.component'
import { tabsSizes } from './tabs.stylex'

const meta = {
  title: 'Base Components/Tabs',
  component: Tabs
} satisfies Meta<typeof Tabs>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  tabs: {
    maxWidth: '100%',
    width: container.large
  },
  trigger: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: 6
  },
  icon: { width: 16, height: 16 }
})

export default meta

// The list's look is a `TabsList` prop; the orientation is the root's.
type PlaygroundArgs = ComponentProps<typeof Tabs> &
  Pick<ComponentProps<typeof TabsList>, 'variant' | 'size'> & { itemWidth?: 'auto' | 'equal' }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['orientation', 'variant', 'size', 'itemWidth'] }
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'radio', options: ['pills', 'pills-raised', 'bordered', 'borderless'] },
    size: { control: 'radio', options: Object.keys(tabsSizes) },
    itemWidth: { control: 'radio', options: ['auto', 'equal'] }
  },
  args: {
    defaultValue: 'account',
    orientation: 'horizontal',
    variant: 'pills',
    size: 'medium',
    itemWidth: 'auto'
  },
  render: ({ variant, size, itemWidth, ...args }) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList
        variant={variant}
        size={size}
        itemWidth={itemWidth === 'equal' ? 'equal' : undefined}
      >
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='password'>Vault Password</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Manage your vault at Gringotts.</TabsContent>
      <TabsContent value='password'>Change the password to your vault.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const account = canvas.getByRole('tab', { name: 'Gringotts Vault' })
    const password = canvas.getByRole('tab', { name: 'Vault Password' })

    await expect(account).toHaveAttribute('aria-selected', 'true')
    await expect(canvas.getByText('Manage your vault at Gringotts.')).toBeInTheDocument()

    // Clicking a trigger swaps the visible panel.
    await userEvent.click(password)
    await expect(password).toHaveAttribute('aria-selected', 'true')
    await expect(account).toHaveAttribute('aria-selected', 'false')
    await expect(canvas.getByText('Change the password to your vault.')).toBeInTheDocument()
  }
}

const variantNames = ['pills', 'pills-raised', 'bordered', 'borderless'] as const

/** The four lists: a tinted pill list, the same lifted on the raised surface, an underline on a rail, and the underline alone. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Tabs defaultValue='overview'>
  <TabsList variant='bordered' aria-label='Newspapers bordered'>
    <TabsTrigger value='overview'>Daily Prophet</TabsTrigger>
    <TabsTrigger value='analytics'>The Quibbler</TabsTrigger>
  </TabsList>
</Tabs>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={variantNames}>
      {(variant) => (
        <Tabs defaultValue='overview'>
          <TabsList variant={variant} aria-label={`Newspapers ${variant}`}>
            <TabsTrigger value='overview'>Daily Prophet</TabsTrigger>
            <TabsTrigger value='analytics'>The Quibbler</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const list = (variant: string) => {
      const element = canvasElement.querySelector(`[data-variant="${variant}"] [role="tablist"]`)
      if (!element) throw new Error(`No tab list for ${variant}`)
      return getComputedStyle(element)
    }
    // Only `pills` has a tinted list; only `bordered` has the rail under it.
    await expect(list('pills').backgroundColor).not.toBe(list('bordered').backgroundColor)
    // `pills-raised` swaps the tint for the raised surface and its shadow.
    await expect(list('pills-raised').backgroundColor).not.toBe(list('pills').backgroundColor)
    await expect(list('pills-raised').boxShadow).not.toBe('none')
    await expect(list('pills').boxShadow).toBe('none')
    await expect(list('bordered').borderBottomWidth).toBe('1px')
    await expect(list('borderless').borderBottomWidth).toBe('0px')
    await expect(list('pills').borderBottomWidth).toBe('0px')
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Tabs defaultValue='one'>
  <TabsList size='small' variant='pills' aria-label='Subjects small pills'>
    <TabsTrigger value='one'>Charms</TabsTrigger>
    <TabsTrigger value='two'>Potions</TabsTrigger>
  </TabsList>
</Tabs>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames} columnAxis='variant' columns={variantNames}>
      {(size, variant) => (
        <Tabs defaultValue='one'>
          <TabsList size={size} variant={variant} aria-label={`Subjects ${size} ${variant}`}>
            <TabsTrigger value='one'>Charms</TabsTrigger>
            <TabsTrigger value='two'>Potions</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </Axis>
  ),
  // The list, tab padding included, is as tall as a control of its size in every variant: the
  // active bar overlaps the `bordered` rail and sits on the edge of `borderless`.
  play: async ({ canvasElement }) => {
    for (const variant of variantNames) {
      await expectControlHeights(canvasElement, denseControlHeights, `[data-variant="${variant}"]`)
    }
    // The `xsmall` pill is 20px tall; a hit area brings every tab to 24px (WCAG 2.5.8).
    for (const tab of canvasElement.querySelectorAll('[role="tab"]')) {
      await expectHitArea(tab)
    }
  }
}

export const Orientations: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Tabs defaultValue='profile' orientation='vertical'>
  <TabsList aria-label='Prefect desk vertical'>
    <TabsTrigger value='profile'>Prefect</TabsTrigger>
    <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
    <TabsTrigger value='notifications'>Owl Post</TabsTrigger>
  </TabsList>
  <TabsContent value='profile'>Update your name at Hogwarts.</TabsContent>
</Tabs>`
      }
    }
  },
  render: () => (
    <Axis axis='orientation' rows={['horizontal', 'vertical'] as const}>
      {(orientation) => (
        <Tabs defaultValue='profile' orientation={orientation}>
          <TabsList aria-label={`Prefect desk ${orientation}`}>
            <TabsTrigger value='profile'>Prefect</TabsTrigger>
            <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
            <TabsTrigger value='notifications'>Owl Post</TabsTrigger>
          </TabsList>
          <TabsContent value='profile'>Update your name at Hogwarts.</TabsContent>
        </Tabs>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const tabs = (orientation: string) =>
      Array.from(
        cellOf(canvasElement, 'orientation', orientation).querySelectorAll('[role="tab"]')
      ).map((el) => el.getBoundingClientRect())
    const [h1, h2] = tabs('horizontal')
    const [v1, v2] = tabs('vertical')
    if (!h1 || !h2 || !v1 || !v2) throw new Error('Tabs not found')
    await expect(h2.left).toBeGreaterThan(h1.left)
    await expect(h2.top).toBe(h1.top)
    await expect(v2.top).toBeGreaterThan(v1.top)
    await expect(v2.left).toBe(v1.left)
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled'] as const}>
      {(state) => (
        <Tabs defaultValue='active'>
          <TabsList aria-label={`Wings ${state}`}>
            <TabsTrigger value='active'>Hogsmeade</TabsTrigger>
            <TabsTrigger value='locked' disabled={state === 'disabled'}>
              Azkaban
            </TabsTrigger>
          </TabsList>
          <TabsContent value='active'>The other tab is locked away in Azkaban.</TabsContent>
        </Tabs>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const locked = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelectorAll('[role="tab"]')[1]
      if (!el) throw new Error(`No second tab for ${state}`)
      return el
    }
    const disabled = locked('disabled')
    await expect(disabled).toHaveAttribute('data-disabled')
    await userEvent.click(disabled)
    await expect(disabled).toHaveAttribute('aria-selected', 'false')
    await expect(locked('default')).not.toHaveAttribute('data-disabled')
  }
}

export const Icons: Story = {
  args: { defaultValue: 'account' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList>
        <TabsTrigger value='account' style={styles.trigger}>
          <User {...stylex.props(styles.icon)} />
          Wizard Profile
        </TabsTrigger>
        <TabsTrigger value='notifications' style={styles.trigger}>
          <BellIcon {...stylex.props(styles.icon)} />
          Owl Post
        </TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Update your wizard profile.</TabsContent>
      <TabsContent value='notifications'>Manage your owl post preferences.</TabsContent>
    </Tabs>
  )
}

/** Tab enters the list on the selected tab, the arrows move focus and Enter selects, Home and End jump, and Tab leaves for the panel. */
export const Keyboard: Story = {
  args: { defaultValue: 'account' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList aria-label='Vault settings'>
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='password'>Vault Password</TabsTrigger>
        <TabsTrigger value='keys'>Vault Keys</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Manage your vault at Gringotts.</TabsContent>
      <TabsContent value='password'>Change the password to your vault.</TabsContent>
      <TabsContent value='keys'>Count the keys in your vault.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const account = canvas.getByRole('tab', { name: 'Gringotts Vault' })
    const password = canvas.getByRole('tab', { name: 'Vault Password' })
    const keys = canvas.getByRole('tab', { name: 'Vault Keys' })

    // Tab enters the list on the selected tab; the arrow keys move focus along it.
    await userEvent.tab()
    await expect(account).toHaveFocus()
    await pressUntil('{ArrowRight}', () => expect(password).toHaveFocus(), {
      when: () => document.activeElement === account
    })
    // Focus moves first; Enter selects.
    await expect(password).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{Enter}')
    await expect(password).toHaveAttribute('aria-selected', 'true')
    await pressUntil('{End}', () => expect(keys).toHaveFocus())
    await pressUntil('{Home}', () => expect(account).toHaveFocus())

    // The list loops: ArrowLeft on the first tab goes to the last, ArrowRight comes back.
    await pressUntil('{ArrowLeft}', () => expect(keys).toHaveFocus(), {
      when: () => document.activeElement === account
    })
    await pressUntil('{ArrowRight}', () => expect(account).toHaveFocus(), {
      when: () => document.activeElement === keys
    })

    // Space selects the focused tab too, and Tab leaves the list for the selected panel.
    await pressUntil('{End}', () => expect(keys).toHaveFocus())
    await userEvent.keyboard(' ')
    await expect(keys).toHaveAttribute('aria-selected', 'true')
    await userEvent.tab()
    await expect(canvas.getByRole('tabpanel', { name: 'Vault Keys' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(keys).toHaveFocus())
  }
}

/** `itemWidth='equal'`: the list spans its parent and every trigger takes an equal share of it. */
export const Widths: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Tabs defaultValue='one'>
  <TabsList itemWidth='equal' aria-label='Wizards equal'>
    <TabsTrigger value='one'>Ron</TabsTrigger>
    <TabsTrigger value='two'>Hermione</TabsTrigger>
    <TabsTrigger value='three'>Dumbledore</TabsTrigger>
  </TabsList>
</Tabs>`
      }
    }
  },
  render: () => (
    <Axis axis='width' rows={['auto', 'equal'] as const} wide>
      {(width) => (
        <Tabs defaultValue='one'>
          <TabsList
            itemWidth={width === 'equal' ? 'equal' : undefined}
            aria-label={`Wizards ${width}`}
          >
            <TabsTrigger value='one'>Ron</TabsTrigger>
            <TabsTrigger value='two'>Hermione</TabsTrigger>
            <TabsTrigger value='three'>Dumbledore</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const widths = (width: string) =>
      Array.from(cellOf(canvasElement, 'width', width).querySelectorAll('[role="tab"]')).map((el) =>
        Math.round(el.getBoundingClientRect().width)
      )
    // Sized to its label, the long label makes its tab wider; equal shares are the same width.
    const auto = widths('auto')
    await expect(new Set(auto).size).toBeGreaterThan(1)
    const equal = widths('equal')
    await expect(Math.max(...equal) - Math.min(...equal)).toBeLessThanOrEqual(1)
    const cell = cellOf(canvasElement, 'width', 'equal')
    const list = cell.querySelector('[role="tablist"]')
    await expect(list?.getBoundingClientRect().width).toBe(cell.getBoundingClientRect().width)
  }
}

/** Every style rule inside a media query that mentions `query` and applies to the element. */
function mediaRules(element: Element, query: string) {
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

// Within a pixel: the indicator and its tab are laid out separately.
const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(1)

const motionCases = [
  'pills',
  'pills-raised',
  'bordered',
  'borderless',
  'vertical',
  'equal'
] as const

/**
 * One indicator slides to the selected tab, and the panel fades in. The pill lists draw the active
 * pill with it and the underline lists draw the bar; the tab itself keeps no active background.
 */
export const Motion: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Tabs defaultValue='one'>
  <TabsList aria-label='Wizards'>
    <TabsTrigger value='one'>Ron</TabsTrigger>
    <TabsTrigger value='two'>Hermione</TabsTrigger>
  </TabsList>
  <TabsContent value='one'>Ron plays chess.</TabsContent>
  <TabsContent value='two'>Hermione reads.</TabsContent>
</Tabs>`
      }
    }
  },
  render: () => (
    <Axis axis='case' rows={motionCases} wide>
      {(name) => (
        <Tabs defaultValue='one' orientation={name === 'vertical' ? 'vertical' : 'horizontal'}>
          <TabsList
            variant={name === 'vertical' || name === 'equal' ? 'pills' : name}
            itemWidth={name === 'equal' ? 'equal' : undefined}
            aria-label={`Wizards ${name}`}
          >
            <TabsTrigger value='one'>Ron</TabsTrigger>
            <TabsTrigger value='two'>Hermione</TabsTrigger>
            <TabsTrigger value='three'>Dumbledore</TabsTrigger>
          </TabsList>
          <TabsContent value='one'>Ron plays chess.</TabsContent>
          <TabsContent value='two'>Hermione reads.</TabsContent>
          <TabsContent value='three'>Dumbledore sucks a lemon drop.</TabsContent>
        </Tabs>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const name of motionCases) {
      const cell = cellOf(canvasElement, 'case', name)
      const list = cell.querySelector('[role="tablist"]')
      const indicator = list?.querySelector(':scope > span[role="presentation"]')
      if (!list || !(indicator instanceof HTMLElement)) throw new Error(`No indicator for ${name}`)
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'))
      const [first, , last] = tabs
      if (!first || !last) throw new Error(`No tabs for ${name}`)
      const underline = name === 'bordered' || name === 'borderless'
      const vertical = name === 'vertical'

      // The indicator is the active mark: the pill fills the tab's box, the bar sits on its edge.
      const settle = async (tab: Element) => {
        await waitFor(async () => {
          const mark = indicator.getBoundingClientRect()
          const box = tab.getBoundingClientRect()
          if (underline) {
            await near(mark.left, box.left)
            await near(mark.right, box.right)
            await near(mark.bottom, box.bottom)
            await near(mark.height, 2)
          } else {
            await near(mark.left, box.left)
            await near(mark.right, box.right)
            await near(mark.top, box.top)
            await near(mark.bottom, box.bottom)
          }
        })
      }
      await waitFor(() => expect(indicator).toBeVisible())
      await settle(first)
      const before = indicator.getBoundingClientRect()
      await expect(getComputedStyle(first).backgroundColor).toBe('rgba(0, 0, 0, 0)')

      // One transition on the axis the list runs along; reduced motion has none.
      const style = getComputedStyle(indicator)
      await expect(style.transitionProperty).toBe(vertical ? 'top, height' : 'left, width')
      await expect(style.transitionDuration).toBe('0.2s')
      await expect(
        mediaRules(indicator, 'prefers-reduced-motion').some(
          (rule) => rule.style.transitionProperty === 'none'
        )
      ).toBe(true)
      // Forced colors drop backgrounds: the indicator keeps an edge in a system color.
      await expect(
        mediaRules(indicator, 'forced-colors').some(
          (rule) => rule.style.backgroundColor === 'highlight' || rule.style.borderWidth === '1px'
        )
      ).toBe(true)

      await userEvent.click(last)
      await settle(last)
      const after = indicator.getBoundingClientRect()
      await expect(last).toHaveAttribute('aria-selected', 'true')
      // It moved along the list; an `equal` list moves it without resizing, the others resize it.
      await expect(
        Math.abs(vertical ? after.top - before.top : after.left - before.left)
      ).toBeGreaterThan(20)
      if (!vertical && name !== 'equal')
        await expect(Math.abs(after.width - before.width)).toBeGreaterThan(8)
      if (name === 'equal') await near(after.width, before.width)

      // The tab keeps no active background of its own, the new panel fades in, and reduced
      // motion keeps the fade and drops the rise.
      const panel = within(cell).getByRole('tabpanel')
      await expect(getComputedStyle(panel).transitionProperty).toBe('opacity, transform')
      await expect(
        mediaRules(panel, 'prefers-reduced-motion').some(
          (rule) => rule.style.transitionProperty === 'opacity'
        )
      ).toBe(true)
    }
  }
}
