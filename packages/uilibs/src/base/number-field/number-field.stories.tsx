import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { ComponentProps } from 'react'
import { expect, userEvent } from 'storybook/test'
import {
  controlHeights,
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook,
  HiddenLabel
} from '../../contracts/control-sizes'
import { expectHitArea } from '../../contracts/hit-area'
import { Axis } from '../../contracts/story-axes'
import { Label } from '../../extra/label'
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { Field, FieldError, FieldLabel } from '../field'
import { NumberField, NumberFieldGroup } from './number-field.component'

const meta = {
  title: 'Base Components/NumberField',
  component: NumberField,
  tags: [] // ['autodocs']
} satisfies Meta<typeof NumberField>

type Story = StoryObj<typeof meta>

export default meta

type PlaygroundArgs = ComponentProps<typeof NumberField> &
  Pick<ComponentProps<typeof NumberFieldGroup>, 'controls'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['size', 'variant', 'controls', 'min', 'max', 'step', 'disabled']
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    controls: { control: 'radio', options: ['stacked', 'sides'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' }
  },
  args: {
    defaultValue: 5,
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    variant: 'outline',
    controls: 'stacked',
    disabled: false
  },
  render: ({ controls, ...args }) => (
    <NumberField {...args}>
      <Label>
        Galleons
        <NumberFieldGroup controls={controls} />
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

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => (
        <>
          <NumberField variant={variant} defaultValue={7} id={`galleons-${variant}`}>
            <NumberFieldGroup />
          </NumberField>
          <HiddenLabel htmlFor={`galleons-${variant}`}>Galleons</HiddenLabel>
        </>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectControlVariants(canvasElement, (cell) => cell.querySelector('[role="group"]'))
}

export const Sizes: Story = {
  render: () => (
    <Axis
      axis='size'
      rows={controlSizeNames}
      columnAxis='part'
      columns={['stacked', 'sides'] as const}
      fill
    >
      {(size, part) => (
        <>
          <NumberField size={size} defaultValue={7} id={`galleons-${size}-${part}`}>
            <NumberFieldGroup controls={part} />
          </NumberField>
          <HiddenLabel htmlFor={`galleons-${size}-${part}`}>Galleons</HiddenLabel>
        </>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const part of ['stacked', 'sides']) {
      await expectControlHeights(canvasElement, controlHeights, `[data-part="${part}"]`)
    }
    // Every stepper reaches 24px (WCAG 2.5.8). The stacked pair is under 24px tall, so each one's
    // hit area grows away from the other, and a point just past the field's edge still reaches it.
    for (const stepper of canvasElement.querySelectorAll('[role="group"] button')) {
      await expectHitArea(stepper)
    }
    const groups = canvasElement.querySelectorAll('[data-part="stacked"] [role="group"]')
    const group = groups[groups.length - 1]
    const [increase, decrease] = group?.querySelectorAll('button') ?? []
    if (!group || !increase || !decrease) throw new Error('No stacked steppers')
    // `elementFromPoint` only sees the viewport.
    group.scrollIntoView({ block: 'center' })
    const up = increase.getBoundingClientRect()
    const down = decrease.getBoundingClientRect()
    await expect(document.elementFromPoint(up.left + up.width / 2, up.top - 4)).toBe(increase)
    await expect(document.elementFromPoint(down.left + down.width / 2, down.bottom + 4)).toBe(
      decrease
    )
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <NumberField defaultValue={-3} min={0}>
              <FieldLabel>Galleons</FieldLabel>
              <NumberFieldGroup />
            </NumberField>
            <FieldError match>A vault cannot hold fewer than zero galleons.</FieldError>
          </Field>
        ) : (
          <NumberField defaultValue={7} disabled={state === 'disabled'}>
            <Label>
              {`Sickles ${state}`}
              <NumberFieldGroup />
            </Label>
          </NumberField>
        )
      }
    </Axis>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('textbox', { name: 'Sickles disabled' })
    await expect(disabled).toBeDisabled()
    // The group dims; the cursor belongs to the input and the steppers inside it.
    const group = disabled.closest('[role="group"]')
    if (!group) throw new Error('No number group')
    await expectDisabledLook(group, { cursor: false })
    const [increase, decrease] = [
      canvas.getAllByRole('button', { name: 'Increase' })[1],
      canvas.getAllByRole('button', { name: 'Decrease' })[1]
    ]
    await expect(increase).toBeDisabled()
    await expect(decrease).toBeDisabled()

    const invalid = canvas.getByRole('textbox', { name: 'Galleons' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid.closest('[role="group"]')).toHaveAttribute('data-invalid')
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
