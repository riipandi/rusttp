import { EyeOff, Eye } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Field, FieldError, FieldLabel } from '../../base/field'
import {
  cellOf,
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { controlSizes } from '../../styles/control.stylex'
import { container } from '../../styles/tokens.stylex'
import { InputPassword } from './input-password.component'

const meta = {
  title: 'Extra Components/InputPassword',
  component: InputPassword
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

const glyphs = { eye: Eye, eyeOff: EyeOff }

export const Playground: Story = {
  // `defaultVisible` only seeds the state, so the render remounts the field when it changes.
  parameters: {
    controls: {
      disable: false,
      include: [
        'placeholder',
        'size',
        'variant',
        'toggleVariant',
        'toggleSize',
        'disabled',
        'defaultVisible',
        'showIcon',
        'hideIcon'
      ]
    }
  },
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: controlVariantNames },
    toggleVariant: { control: 'radio', options: ['solid', 'faded', 'outline', 'ghost'] },
    toggleSize: { control: 'radio', options: ['xsmall', 'small'] },
    disabled: { control: 'boolean' },
    defaultVisible: { control: 'boolean' },
    // A glyph is a component: the control lists names and `mapping` maps each to its glyph.
    showIcon: { control: 'select', options: Object.keys(glyphs), mapping: glyphs },
    hideIcon: { control: 'select', options: Object.keys(glyphs), mapping: glyphs }
  },
  args: {
    placeholder: 'Enter the password...',
    size: 'medium',
    variant: 'outline',
    toggleVariant: 'ghost',
    toggleSize: 'xsmall',
    disabled: false,
    defaultVisible: false,
    showIcon: Eye,
    hideIcon: EyeOff
  },
  render: (args) => (
    <div {...stylex.props(styles.field)}>
      <InputPassword key={String(args.defaultVisible)} {...args} />
    </div>
  )
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  parameters: {
    docs: { source: { code: `<InputPassword variant='faded' aria-label='Password faded' />` } }
  },
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => <InputPassword variant={variant} aria-label={`Password ${variant}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  parameters: {
    docs: { source: { code: `<InputPassword size='large' aria-label='Password large' />` } }
  },
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => <InputPassword size={size} aria-label={`Password ${size}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<InputPassword aria-label='Passphrase disabled' placeholder='Sealed by the Ministry' disabled />

<Field invalid>
  <FieldLabel htmlFor='input-password-invalid'>Vault passphrase</FieldLabel>
  <InputPassword id='input-password-invalid' defaultValue='123' />
  <FieldError>The passphrase must be at least 8 characters.</FieldError>
</Field>`
      }
    }
  },
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
    await expectDisabledLook(group, { text: true, edge: true, cursor: false })

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
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(false)

<InputPassword
  aria-label='Password'
  visible={visible}
  onVisibleChange={setVisible}
  defaultValue='expecto-patronum'
/>`
      }
    }
  },
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
      <InputPassword placeholder='Custom toggle icons...' showIcon={Eye} hideIcon={EyeOff} />
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

/** Tab moves from the input to the toggle; Space and Enter press the toggle and focus stays on it. */
export const Keyboard: Story = {
  render: () => (
    <div {...stylex.props(styles.field)}>
      <InputPassword aria-label='Vault passphrase' defaultValue='alohomora' />
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Vault passphrase')
    const toggle = canvas.getByRole('button', { name: 'Show password' })
    input.focus()
    await userEvent.tab()
    await waitFor(() => expect(toggle).toHaveFocus())
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(input).toHaveFocus())
    await userEvent.tab()
    await waitFor(() => expect(toggle).toHaveFocus())

    // Space shows the value; Enter hides it again. The toggle keeps focus and its one name.
    await pressUntil(' ', () => expect(input).toHaveAttribute('type', 'text'), {
      when: () => input.getAttribute('type') === 'password'
    })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveFocus()
    await pressUntil('{Enter}', () => expect(input).toHaveAttribute('type', 'password'), {
      when: () => input.getAttribute('type') === 'text'
    })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle).toHaveAccessibleName('Show password')
    await expect(toggle).toHaveFocus()
  }
}
