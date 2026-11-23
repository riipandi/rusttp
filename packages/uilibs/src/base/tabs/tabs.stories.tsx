import { Bell as BellIcon, User } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import {
  cellOf,
  denseControlHeights,
  denseControlSizeNames,
  expectControlHeights
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.component'

const meta = {
  title: 'Base Components/Tabs',
  component: Tabs,
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] }
  },
  tags: [] // ['autodocs']
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

export const Playground: Story = {
  args: { defaultValue: 'account' },
  render: (args) => (
    <Tabs {...args} style={styles.tabs}>
      <TabsList>
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
  }
}

export const Orientations: Story = {
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
    await userEvent.keyboard('{ArrowRight}')
    await expect(password).toHaveFocus()
    // Focus moves first; Enter selects.
    await userEvent.keyboard('{Enter}')
    await expect(password).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{End}')
    await expect(keys).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(account).toHaveFocus()
  }
}

/** `itemWidth='equal'`: the list spans its parent and every trigger takes an equal share of it. */
export const Widths: Story = {
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
