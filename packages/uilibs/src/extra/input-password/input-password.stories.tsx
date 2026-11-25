import { EyeOff, Eye } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { Field, FieldError, FieldLabel } from '../../base/field'
import {
  cellOf,
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { controlSizes } from '../../styles/control.stylex'
import { container } from '../../styles/tokens.stylex'
import { InputPassword } from './input-password.component'

const meta = {
  title: 'Extra Components/InputPassword',
  component: InputPassword,
  tags: [] // ['autodocs']
} satisfies Meta<typeof InputPassword>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: container.medium
  }
})

export default meta

export const Playground: Story = {
  // `defaultVisible` only seeds the state, so the render remounts the field when it changes.
  parameters: {
    controls: { disable: false, include: ['placeholder', 'size', 'disabled', 'defaultVisible'] }
  },
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'radio', options: Object.keys(controlSizes) },
    disabled: { control: 'boolean' },
    defaultVisible: { control: 'boolean' }
  },
  args: {
    placeholder: 'Enter the password...',
    size: 'md',
    disabled: false,
    defaultVisible: false
  },
  render: (args) => (
    <div {...stylex.props(styles.field)}>
      <InputPassword key={String(args.defaultVisible)} {...args} />
    </div>
  )
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => <InputPassword variant={variant} aria-label={`Password ${variant}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => <InputPassword size={size} aria-label={`Password ${size}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel htmlFor='input-password-invalid'>Vault passphrase</FieldLabel>
            <InputPassword id='input-password-invalid' defaultValue='123' />
            <FieldError>The passphrase must be at least 8 characters.</FieldError>
          </Field>
        ) : (
          <InputPassword
            aria-label={`Passphrase ${state}`}
            placeholder='Sealed by the Ministry'
            disabled={state === 'disabled'}
          />
        )
      }
    </Axis>
  ),
  play: async ({ canvas, canvasElement }) => {
    const disabled = cellOf(canvasElement, 'state', 'disabled').querySelector('input')
    if (!disabled) throw new Error('No password input for disabled')
    await expect(disabled).toBeDisabled()
    const group = disabled.closest('[role="group"]')
    if (!group) throw new Error('No password group')
    await expectDisabledLook(group, { cursor: false })

    const invalid = canvas.getByLabelText('Vault passphrase')
    await expect(invalid).toHaveAttribute('data-invalid')
  }
}

export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <Field style={styles.field}>
      <FieldLabel htmlFor='input-password-labeled'>Vault passphrase</FieldLabel>
      <InputPassword id='input-password-labeled' placeholder='Pick a strong one...' />
    </Field>
  )
}

export const VisibleByDefault: Story = {
  name: 'Visible by default',
  render: () => (
    <div {...stylex.props(styles.field)}>
      <InputPassword defaultVisible defaultValue='alohomora-2024' aria-label='Password' />
    </div>
  )
}

export const Controlled: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(false)
    return (
      <div {...stylex.props(styles.field)}>
        <InputPassword
          aria-label='Password'
          visible={visible}
          onVisibleChange={setVisible}
          defaultValue='expecto-patronum'
        />
        <button type='button' onClick={() => setVisible((v) => !v)}>
          External toggle
        </button>
      </div>
    )
  }
}

export const CustomIcons: Story = {
  name: 'Custom icons',
  render: () => (
    <div {...stylex.props(styles.field)}>
      <InputPassword
        placeholder='Custom toggle icons...'
        showIcon={<Eye size={16} />}
        hideIcon={<EyeOff size={16} />}
      />
    </div>
  )
}

export const Interaction: Story = {
  render: () => (
    <div {...stylex.props(styles.field)}>
      <InputPassword id='input-password-toggle' placeholder='Type and toggle...' />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByPlaceholderText('Type and toggle...')
    await userEvent.type(el, 'alohomora')
    await expect(el).toHaveAttribute('type', 'password')
    await expect(el).toHaveValue('alohomora')
    // One name for both states: `aria-pressed` carries the state, never "Hide password, pressed".
    const toggle = canvas.getByRole('button', { name: 'Show password', pressed: false })
    await userEvent.click(toggle)
    await expect(el).toHaveAttribute('type', 'text')
    await expect(toggle).toHaveAccessibleName('Show password')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.queryByRole('button', { name: /hide/i })).toBeNull()
    await userEvent.click(toggle)
    await expect(el).toHaveAttribute('type', 'password')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  }
}

export const Translated: Story = {
  render: () => (
    <InputPassword aria-label='Kata sandi' labels={{ toggle: 'Tampilkan kata sandi' }} />
  ),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Tampilkan kata sandi' })
    await userEvent.click(toggle)
    await expect(toggle).toHaveAccessibleName('Tampilkan kata sandi')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  }
}
