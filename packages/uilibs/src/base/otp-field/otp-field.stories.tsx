import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { ControlSizesColumn, expectControlHeights } from '../../contracts/control-sizes'
import { colors } from '../../styles/colors.stylex'
import { fontSize, radius } from '../../styles/tokens.stylex'
import { Field, FieldError, FieldLabel } from '../field'
import { OTPField, OTPFieldGroup, OTPFieldSeparator, OTPFieldSlot } from './otp-field.component'

const meta = {
  title: 'Base Components/OTPField',
  component: OTPField,
  parameters: { layout: 'centered' },
  argTypes: {
    length: { control: 'number' },
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

export const Playground: Story = {
  args: { length: 6, 'aria-label': 'Verification code' },
  render: (args) => (
    <OTPField {...args}>
      <OTPFieldSlot style={styles.standalone} />
      <OTPFieldSlot style={styles.standalone} />
      <OTPFieldSlot style={styles.standalone} />
      <OTPFieldSlot style={styles.standalone} />
      <OTPFieldSlot style={styles.standalone} />
      <OTPFieldSlot style={styles.standalone} />
    </OTPField>
  )
}

export const Joined: Story = {
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

export const Disabled: Story = {
  args: { length: 6, disabled: true, defaultValue: '123456', 'aria-label': 'Verification code' },
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
  ),
  play: async ({ canvas }) => {
    const slots = canvas.getAllByRole('textbox')
    const first = slots[0]
    if (!first) throw new Error('No OTP slots rendered')
    for (const slot of slots) await expect(slot).toBeDisabled()
    await userEvent.type(first, '9')
    await expect(first).toHaveValue('1')
  }
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

export const ControlSizes: Story = {
  args: { length: 4 },
  render: () => (
    <ControlSizesColumn>
      {(size) => (
        <OTPField size={size} length={4} aria-label={`Code ${size}`}>
          <OTPFieldGroup>
            {[1, 2, 3, 4].map((position) => (
              <OTPFieldSlot key={position} aria-label={`Character ${position} of 4`} />
            ))}
          </OTPFieldGroup>
        </OTPField>
      )}
    </ControlSizesColumn>
  ),
  play: async ({ canvasElement }) => {
    await expectControlHeights(canvasElement)
    // A slot is a square the height of the control.
    for (const slot of canvasElement.querySelectorAll('input')) {
      await expect(slot.getBoundingClientRect().width).toBe(slot.getBoundingClientRect().height)
    }
  }
}

export const Invalid: Story = {
  args: { length: 6, defaultValue: '123456' },
  render: (args) => (
    <Field invalid>
      <FieldLabel>Verification code</FieldLabel>
      <OTPField {...args}>
        <OTPFieldGroup>
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <OTPFieldSlot key={slot} />
          ))}
        </OTPFieldGroup>
      </OTPField>
      <FieldError match>That code has expired. Ask the Owl Office for a new one.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    const slots = canvas.getAllByRole('textbox')
    await expect(slots).toHaveLength(6)
    for (const slot of slots) await expect(slot).toHaveAttribute('data-invalid')
    // The first slot takes the field's label, the others their position.
    await expect(slots[0]).toHaveAccessibleName('Verification code')
    await expect(slots[1]).toHaveAccessibleName('Character 2 of 6')
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
