import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import { HiddenLabel, controlSizeNames, expectControlHeights } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Label } from '../../extra/label'
import { Field, FieldError, FieldLabel } from '../field'
import { NumberField, NumberFieldGroup } from './number-field.component'

const meta = {
  title: 'Base Components/NumberField',
  component: NumberField,
  parameters: { layout: 'centered' },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' }
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
} satisfies Meta<typeof NumberField>

type Story = StoryObj<typeof meta>

export default meta

export const Playground: Story = {
  args: { defaultValue: 5, min: 0, max: 100 },
  render: (args) => (
    <NumberField {...args}>
      <Label>
        Galleons
        <NumberFieldGroup />
      </Label>
    </NumberField>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Galleons' })
    await expect(input).toHaveValue('5')

    // Stepper buttons adjust the value by one.
    await userEvent.click(canvas.getByRole('button', { name: 'Increase' }))
    await expect(input).toHaveValue('6')
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }))
    await expect(input).toHaveValue('4')

    // Typing a value works too.
    await userEvent.clear(input)
    await userEvent.type(input, '17')
    await expect(input).toHaveValue('17')
  }
}

export const MinMaxStep: Story = {
  name: 'Min, max, and step',
  args: { defaultValue: 20, min: 0, max: 100, step: 5 },
  render: (args) => (
    <NumberField {...args}>
      <Label>
        Butterbeer pints
        <NumberFieldGroup />
      </Label>
    </NumberField>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Butterbeer pints' })

    // Step increments land on multiples of 5.
    await userEvent.click(canvas.getByRole('button', { name: 'Increase' }))
    await expect(input).toHaveValue('25')

    // Typing a valid in-range value keeps it on blur (no snapping).
    await userEvent.clear(input)
    await userEvent.type(input, '7')
    await userEvent.tab()
    await expect(input).toHaveValue('7')
  }
}

export const Formatted: Story = {
  args: {
    defaultValue: 49.99,
    min: 0,
    step: 1,
    format: { style: 'currency', currency: 'USD' }
  },
  render: (args) => (
    <NumberField {...args}>
      <Label>
        Gringotts fee
        <NumberFieldGroup />
      </Label>
    </NumberField>
  )
}

export const ControlSizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <>
          <NumberField size={size} defaultValue={7} id={`galleons-${size}`}>
            <NumberFieldGroup />
          </NumberField>
          <HiddenLabel htmlFor={`galleons-${size}`}>Galleons</HiddenLabel>
        </>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const SideControlSizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <>
          <NumberField size={size} defaultValue={7} id={`sickles-${size}`}>
            <NumberFieldGroup controls='sides' />
          </NumberField>
          <HiddenLabel htmlFor={`sickles-${size}`}>Sickles</HiddenLabel>
        </>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const Invalid: Story = {
  render: () => (
    <Field invalid>
      <NumberField defaultValue={-3} min={0}>
        <FieldLabel>Galleons</FieldLabel>
        <NumberFieldGroup />
      </NumberField>
      <FieldError match>A vault cannot hold fewer than zero galleons.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Galleons' })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input.closest('[role="group"]')).toHaveAttribute('data-invalid')
  }
}

export const Disabled: Story = {
  render: () => (
    <NumberField defaultValue={7} disabled>
      <Label>
        Galleons
        <NumberFieldGroup />
      </Label>
    </NumberField>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Galleons' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Increase' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Decrease' })).toBeDisabled()
  }
}

export const Keyboard: Story = {
  render: () => (
    <NumberField defaultValue={7} min={0} max={9}>
      <Label>
        Galleons
        <NumberFieldGroup />
      </Label>
    </NumberField>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Galleons' })

    // The arrow keys step the value, Home and End jump to the limits.
    await userEvent.tab()
    await expect(input).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect(input).toHaveValue('8')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(input).toHaveValue('6')
    await userEvent.keyboard('{End}')
    await expect(input).toHaveValue('9')
    await userEvent.keyboard('{Home}')
    await expect(input).toHaveValue('0')
  }
}
