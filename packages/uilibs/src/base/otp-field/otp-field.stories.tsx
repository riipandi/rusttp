import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import {
  cellOf,
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { fontSize, radius } from '../../styles/tokens.stylex'
import { Field, FieldError, FieldLabel } from '../field'
import { OTPField, OTPFieldGroup, OTPFieldSeparator, OTPFieldSlot } from './otp-field.component'

const meta = {
  title: 'Base Components/OTPField',
  component: OTPField,
  tags: [] // ['autodocs']
} satisfies Meta<typeof OTPField>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  col: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  value: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2
  },
  standalone: {
    borderBottomLeftRadius: { default: radius.medium, ':first-child': radius.medium },
    borderBottomRightRadius: { default: radius.medium, ':last-child': radius.medium },
    borderTopLeftRadius: { default: radius.medium, ':first-child': radius.medium },
    borderTopRightRadius: { default: radius.medium, ':last-child': radius.medium },
    marginLeft: { default: 0, ':first-child': 0 }
  }
})

export default meta

const valueOf = (slot: HTMLElement) => (slot instanceof HTMLInputElement ? slot.value : '')

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['length', 'size', 'variant', 'mask', 'disabled'] }
  },
  argTypes: {
    length: { control: { type: 'number', min: 1, max: 8 } },
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    mask: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    length: 6,
    size: 'medium',
    variant: 'outline',
    mask: false,
    disabled: false,
    'aria-label': 'Verification code'
  },
  render: (args) => (
    <OTPField {...args}>
      {Array.from({ length: args.length }, (_, index) => (
        <OTPFieldSlot key={index} style={styles.standalone} />
      ))}
    </OTPField>
  )
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<OTPField variant='faded' length={4} aria-label='Code faded'>
  <OTPFieldGroup>
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
  </OTPFieldGroup>
</OTPField>`
      }
    }
  },
  args: { length: 4 },
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => (
        <OTPField variant={variant} length={4} aria-label={`Code ${variant}`}>
          <OTPFieldGroup>
            {[1, 2, 3, 4].map((position) => (
              <OTPFieldSlot key={position} aria-label={`Character ${position} of 4`} />
            ))}
          </OTPFieldGroup>
        </OTPField>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectControlVariants(canvasElement, (cell) => cell.querySelector('input'))
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<OTPField size='large' length={4} aria-label='Code large'>
  <OTPFieldGroup>
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
  </OTPFieldGroup>
</OTPField>`
      }
    }
  },
  args: { length: 4 },
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <OTPField size={size} length={4} aria-label={`Code ${size}`}>
          <OTPFieldGroup>
            {[1, 2, 3, 4].map((position) => (
              <OTPFieldSlot key={position} aria-label={`Character ${position} of 4`} />
            ))}
          </OTPFieldGroup>
        </OTPField>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    await expectControlHeights(canvasElement)
    // A slot is a square the height of the control.
    for (const slot of canvasElement.querySelectorAll('input')) {
      await expect(slot.getBoundingClientRect().width).toBe(slot.getBoundingClientRect().height)
    }
  }
}

export const States: Story = {
  args: { length: 4 },
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel>Verification code</FieldLabel>
            <OTPField length={4} defaultValue='1234'>
              <OTPFieldGroup>
                {[0, 1, 2, 3].map((slot) => (
                  <OTPFieldSlot key={slot} />
                ))}
              </OTPFieldGroup>
            </OTPField>
            <FieldError match>That code has expired. Ask the Owl Office for a new one.</FieldError>
          </Field>
        ) : (
          <OTPField
            length={4}
            defaultValue={state === 'disabled' ? '1234' : ''}
            disabled={state === 'disabled'}
            aria-label={`Code ${state}`}
          >
            <OTPFieldGroup>
              {[0, 1, 2, 3].map((slot) => (
                <OTPFieldSlot key={slot} />
              ))}
            </OTPFieldGroup>
          </OTPField>
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const slots = (state: string) =>
      Array.from(
        cellOf(canvasElement, 'state', state).querySelectorAll('input:not([aria-hidden="true"])')
      )
    const disabled = slots('disabled')
    await expect(disabled).toHaveLength(4)
    for (const slot of disabled) {
      await expect(slot).toBeDisabled()
      await expectDisabledLook(slot)
    }
    const first = disabled[0]
    if (!first) throw new Error('No OTP slots rendered')
    await userEvent.type(first, '9')
    await expect(first).toHaveValue('1')

    const invalid = slots('invalid')
    for (const slot of invalid) await expect(slot).toHaveAttribute('data-invalid')
    // The first slot takes the field's label, the others their position.
    await expect(invalid[0]).toHaveAccessibleName('Verification code')
    await expect(invalid[1]).toHaveAccessibleName('Character 2 of 4')
  }
}

export const Joined: Story = {
  parameters: {
    docs: {
      source: {
        code: `<OTPField length={6} aria-label='Verification code'>
  <OTPFieldGroup>
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
  </OTPFieldGroup>
</OTPField>`
      }
    }
  },
  name: 'Joined slots',
  args: { length: 6, 'aria-label': 'Verification code' },
  render: (args) => (
    <OTPField {...args}>
      <OTPFieldGroup>
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
      </OTPFieldGroup>
    </OTPField>
  )
}

export const Separator: Story = {
  parameters: {
    docs: {
      source: {
        code: `<OTPField length={8} aria-label='Verification code'>
  <OTPFieldGroup>
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
  </OTPFieldGroup>
  <OTPFieldSeparator />
  <OTPFieldGroup>
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
    <OTPFieldSlot />
  </OTPFieldGroup>
</OTPField>`
      }
    }
  },
  args: { length: 8, 'aria-label': 'Verification code' },
  render: (args) => (
    <OTPField {...args}>
      <OTPFieldGroup>
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
      </OTPFieldGroup>
      <OTPFieldSeparator />
      <OTPFieldGroup>
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSlot />
      </OTPFieldGroup>
    </OTPField>
  )
}

export const Controlled: Story = {
  args: { length: 6, 'aria-label': 'Verification code' },
  render: () => {
    const [value, setValue] = React.useState('')

    return (
      <div {...stylex.props(styles.col)}>
        <OTPField aria-label='Verification code' length={6} value={value} onValueChange={setValue}>
          <OTPFieldGroup>
            <OTPFieldSlot />
            <OTPFieldSlot />
            <OTPFieldSlot />
            <OTPFieldSlot />
            <OTPFieldSlot />
            <OTPFieldSlot />
          </OTPFieldGroup>
        </OTPField>
        <p {...stylex.props(styles.value)}>
          {value ? `Vault code: ${value}` : 'Enter your Gringotts vault code.'}
        </p>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const slots = canvas.getAllByRole('textbox')
    const first = slots[0]
    if (!first) throw new Error('No OTP slots rendered')

    // Typing fills one character per slot and advances focus.
    await userEvent.type(first, '924')
    await expect(canvas.getByText('Vault code: 924')).toBeInTheDocument()
  }
}

/** An `aria-label` on the root names the first slot too. */
export const NamedByAriaLabel: Story = {
  name: 'Named by aria-label',
  args: { length: 4, 'aria-label': 'Verification code' },
  render: (args) => (
    <OTPField {...args}>
      <OTPFieldGroup>
        {[0, 1, 2, 3].map((slot) => (
          <OTPFieldSlot key={slot} />
        ))}
      </OTPFieldGroup>
    </OTPField>
  ),
  play: async ({ canvas }) => {
    const slots = canvas.getAllByRole('textbox')
    await expect(slots[0]).toHaveAccessibleName('Verification code')
    await expect(slots[3]).toHaveAccessibleName('Character 4 of 4')
  }
}

export const Keyboard: Story = {
  args: { length: 4, 'aria-label': 'Verification code' },
  render: (args) => (
    <OTPField {...args}>
      <OTPFieldGroup>
        {[0, 1, 2, 3].map((slot) => (
          <OTPFieldSlot key={slot} />
        ))}
      </OTPFieldGroup>
    </OTPField>
  ),
  play: async ({ canvas }) => {
    const slots = canvas.getAllByRole('textbox')

    // Typing fills the slots in order and moves focus along; Backspace steps back and clears.
    await userEvent.tab()
    await expect(slots[0]).toHaveFocus()
    await userEvent.keyboard('12')
    await expect(slots[0]).toHaveValue('1')
    await expect(slots[1]).toHaveValue('2')
    await expect(slots[2]).toHaveFocus()
    // Home goes to the first slot, End to the slot after the last filled one.
    await userEvent.keyboard('{Home}')
    await expect(slots[0]).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(slots[2]).toHaveFocus()
    await userEvent.keyboard('{Backspace}')
    await expect(slots[1]).toHaveValue('')
    await expect(slots[1]).toHaveFocus()

    // Fill the rest, then move between the slots without editing them.
    await userEvent.keyboard('234')
    await expect(slots.map(valueOf)).toEqual(['1', '2', '3', '4'])
    await expect(slots[3]).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(slots[2]).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(slots[0]).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(slots[1]).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(slots[3]).toHaveFocus()

    // Delete clears the focused slot and Ctrl + Backspace clears them all, back to the first.
    await userEvent.keyboard('{Delete}')
    await expect(slots[3]).toHaveValue('')
    await userEvent.keyboard('{Control>}{Backspace}{/Control}')
    await expect(slots.map(valueOf)).toEqual(['', '', '', ''])
    await expect(slots[0]).toHaveFocus()
  }
}

/** The slots shrink to the row instead of overflowing a screen narrower than the code. */
export const NarrowRow: Story = {
  args: { length: 6, 'aria-label': 'Verification code' },
  render: (args) => (
    <div style={{ width: 220 }} data-testid='narrow'>
      <OTPField {...args}>
        <OTPFieldGroup>
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
        </OTPFieldGroup>
      </OTPField>
    </div>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByTestId('narrow')
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth)
    const slots = canvas.getAllByRole('textbox')
    await expect(slots.length).toBe(6)
    for (const slot of slots) await expect(slot.getBoundingClientRect().width).toBeGreaterThan(20)
  }
}
