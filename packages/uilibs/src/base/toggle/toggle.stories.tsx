import { Bold, Italic } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import {
  denseControlHeights,
  denseControlSizeNames,
  expectControlHeights
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Toggle } from './toggle.component'

const meta = {
  title: 'Base Components/Toggle',
  component: Toggle,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'radio', options: ['ghost', 'outline', 'solid'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' }
  },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div
        {...stylex.props(
          atoms.display.flex,
          atoms.justifyContent.center,
          atoms.padding['20px'],
          atoms.minWidth['448px'],
          atoms.width['100%']
        )}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Toggle>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 8
  }
})

export default meta

export const Playground: Story = {
  render: () => (
    <Toggle aria-label='Toggle charm'>
      <Bold {...stylex.props(styles.icon)} />
    </Toggle>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('button', { name: 'Toggle charm' })
    await expect(el).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(el)
    await expect(el).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(el)
    await expect(el).toHaveAttribute('aria-pressed', 'false')
  }
}

const variantNames = ['ghost', 'outline', 'solid'] as const
const colorNames = ['neutral', 'primary', 'critical'] as const

/** The three fills at rest: transparent, with an edge, and on a neutral fill. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={variantNames}>
      {(variant) => (
        <Toggle variant={variant} aria-label={`Toggle ${variant}`}>
          {variant}
        </Toggle>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const style = (variant: string) =>
      getComputedStyle(canvas.getByRole('button', { name: `Toggle ${variant}` }))
    await expect(style('outline').borderTopWidth).toBe('1px')
    await expect(style('ghost').borderTopWidth).toBe('0px')
    await expect(style('solid').backgroundColor).not.toBe(style('ghost').backgroundColor)
  }
}

/** The pressed state in every color of every fill; the a11y gate checks the contrast of each. */
export const Colors: Story = {
  render: () => (
    <Axis axis='variant' rows={variantNames} columnAxis='color' columns={colorNames}>
      {(variant, color) => (
        <Toggle
          variant={variant}
          selectedColor={color}
          defaultPressed
          aria-label={`Pressed ${variant} ${color}`}
        >
          {color}
        </Toggle>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const fill = (variant: string, color: string) =>
      getComputedStyle(canvas.getByRole('button', { name: `Pressed ${variant} ${color}` }))
        .backgroundColor
    // The pressed state takes the color: three colors, three fills, in every variant.
    for (const variant of variantNames) {
      await expect(new Set(colorNames.map((color) => fill(variant, color))).size).toBe(3)
    }
  }
}

export const WithText: Story = {
  name: 'With text',
  render: () => (
    <Toggle aria-label='Toggle hex'>
      <Italic {...stylex.props(styles.icon)} />
      Hex
    </Toggle>
  )
}

export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Toggle size='xs' aria-label='Toggle pixie'>
        Pixie
      </Toggle>
      <Toggle size='sm' aria-label='Toggle imp'>
        Imp
      </Toggle>
      <Toggle size='md' aria-label='Toggle wizard'>
        Wizard
      </Toggle>
      <Toggle size='lg' aria-label='Toggle giant'>
        Giant
      </Toggle>
    </div>
  )
}

export const ControlSizes: Story = {
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Toggle size={size} aria-label={`Toggle charm ${size}`}>
          Charm
        </Toggle>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => await expectControlHeights(canvasElement, denseControlHeights)
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Toggle {...args} aria-label='Toggle charm'>
      Charm
    </Toggle>
  )
}

export const Keyboard: Story = {
  render: () => (
    <Toggle aria-label='Toggle hex'>
      <Bold {...stylex.props(styles.icon)} />
    </Toggle>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('button', { name: 'Toggle hex' })

    // Tab reaches it; Space and Enter both press it.
    await userEvent.tab()
    await expect(el).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(el).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard('{Enter}')
    await expect(el).toHaveAttribute('aria-pressed', 'false')
  }
}
