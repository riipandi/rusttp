import { Bold, Italic } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import {
  cellOf,
  denseControlHeights,
  denseControlSizeNames,
  expectControlHeights,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Toggle } from './toggle.component'
import { toggleSizes, toggleVariants } from './toggle.stylex'

const meta = {
  title: 'Base Components/Toggle',
  component: Toggle,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Toggle>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: ['variant', 'selectedVariant', 'selectedColor', 'size', 'disabled']
    }
  },
  argTypes: {
    variant: { control: 'radio', options: Object.keys(toggleVariants) },
    selectedVariant: { control: 'radio', options: Object.keys(toggleVariants) },
    selectedColor: {
      control: 'radio',
      options: ['neutral', 'primary', 'critical', 'positive', 'warning']
    },
    size: { control: 'radio', options: Object.keys(toggleSizes) },
    disabled: { control: 'boolean' }
  },
  args: { variant: 'ghost', selectedColor: 'neutral', size: 'medium', disabled: false },
  render: (args) => (
    <Toggle {...args} aria-label='Toggle charm'>
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
const selectedNames = ['rest', 'ghost', 'outline', 'solid'] as const
const colorNames = ['neutral', 'primary', 'critical', 'positive', 'warning'] as const

/**
 * The three fills at rest (the `rest` column), and each fill of the pressed state: `selectedVariant`
 * decides how a toggle looks once pressed, whatever it looks like at rest.
 */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={variantNames} columnAxis='selected' columns={selectedNames}>
      {(variant, selected) => (
        <Toggle
          variant={variant}
          selectedVariant={selected === 'rest' ? undefined : selected}
          selectedColor='primary'
          defaultPressed={selected !== 'rest'}
          aria-label={`Charm ${variant} ${selected}`}
        >
          Charm
        </Toggle>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const toggle = (variant: string, selected: string) =>
      canvas.getByRole('button', { name: `Charm ${variant} ${selected}` })
    const style = (variant: string, selected: string) => getComputedStyle(toggle(variant, selected))
    await expect(style('outline', 'rest').borderTopWidth).toBe('1px')
    await expect(style('ghost', 'rest').borderTopWidth).toBe('0px')
    await expect(style('solid', 'rest').backgroundColor).not.toBe(
      style('ghost', 'rest').backgroundColor
    )

    for (const variant of variantNames) {
      // The pressed fill follows `selectedVariant`, not `variant`: three fills, three looks.
      const looks = selectedNames
        .filter((selected) => selected !== 'rest')
        .map((selected) => {
          const pressed = style(variant, selected)
          return `${pressed.backgroundColor}|${pressed.color}|${pressed.boxShadow}`
        })
      await expect(new Set(looks).size).toBe(3)
      // An outline edge is drawn inside the box, so pressing never resizes the toggle.
      await expect(toggle(variant, 'outline').getBoundingClientRect().width).toBeCloseTo(
        toggle(variant, 'ghost').getBoundingClientRect().width,
        0
      )
    }
    // Unset, `selectedVariant` follows `variant`: a solid toggle presses to a solid fill.
    await expect(style('solid', 'solid').backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  }
}

/** The pressed state in every color of every fill; the a11y gate checks the contrast of each. */
export const Colors: Story = {
  render: () => (
    <Axis axis='selected' rows={variantNames} columnAxis='color' columns={colorNames}>
      {(selected, color) => (
        <Toggle
          selectedVariant={selected}
          selectedColor={color}
          defaultPressed
          aria-label={`Pressed ${selected} ${color}`}
        >
          {color}
        </Toggle>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const look = (selected: string, color: string) => {
      const style = getComputedStyle(
        canvas.getByRole('button', { name: `Pressed ${selected} ${color}` })
      )
      return `${style.backgroundColor}|${style.color}|${style.boxShadow}`
    }
    // The pressed state takes the color: five colors, five looks, in every fill.
    for (const selected of variantNames) {
      await expect(new Set(colorNames.map((color) => look(selected, color))).size).toBe(
        colorNames.length
      )
    }
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'pressed', 'disabled'] as const}>
      {(state) => (
        <Toggle
          aria-label={`Toggle charm ${state}`}
          defaultPressed={state === 'pressed'}
          disabled={state === 'disabled'}
        >
          Charm
        </Toggle>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const toggle = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelector('button')
      if (!el) throw new Error(`No toggle for ${state}`)
      return el
    }
    await expect(toggle('default')).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle('pressed')).toHaveAttribute('aria-pressed', 'true')

    const disabled = toggle('disabled')
    await expect(disabled).toBeDisabled()
    await expectDisabledLook(disabled)
    await userEvent.click(disabled)
    await expect(disabled).toHaveAttribute('aria-pressed', 'false')
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
