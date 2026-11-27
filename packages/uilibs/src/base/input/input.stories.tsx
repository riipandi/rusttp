import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import {
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { container, fontFamily, fontSize, fontWeight } from '../../styles/tokens.stylex'
import { Button } from '../button'
import { Field, FieldError, FieldLabel } from '../field'
import { Input } from './input.component'

const meta = {
  title: 'Base Components/Input',
  component: Input,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Input>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  wrap: {
    width: container.medium
  },
  narrow: {
    width: container.small
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: container.medium
  },
  label: {
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium
  },
  row: {
    display: 'flex',
    gap: 8
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['placeholder', 'size', 'variant', 'disabled'] }
  },
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    disabled: { control: 'boolean' }
  },
  args: { placeholder: 'Owl post address', size: 'medium', variant: 'outline', disabled: false },
  render: (args) => (
    <div {...stylex.props(styles.wrap)}>
      <Input type='email' {...args} />
    </div>
  )
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Input variant='outline' aria-label='Spell outline' placeholder='Spell' />
<Input variant='faded' aria-label='Spell faded' placeholder='Spell' />
<Input variant='ghost' aria-label='Spell ghost' placeholder='Spell' />
<Input variant='headless' aria-label='Spell headless' placeholder='Spell' />`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => <Input variant={variant} aria-label={`Spell ${variant}`} placeholder='Spell' />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Input size='small' aria-label='Spell small' placeholder='Spell' />
<Input size='medium' aria-label='Spell medium' placeholder='Spell' />
<Input size='large' aria-label='Spell large' placeholder='Spell' />`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => <Input size={size} aria-label={`Spell ${size}`} placeholder='Spell' />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Input aria-label='Seal default' placeholder='Sealed by the Ministry' />
<Input aria-label='Seal disabled' placeholder='Sealed by the Ministry' disabled />

<Field invalid>
  <FieldLabel htmlFor='email'>Owl post address</FieldLabel>
  <Input id='email' type='email' defaultValue='ron.weasley@hogwarts' />
  <FieldError match>That owl address is not registered with the Owl Office.</FieldError>
</Field>`
      }
    }
  },
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel htmlFor='input-invalid-email'>Owl post address</FieldLabel>
            <Input id='input-invalid-email' type='email' defaultValue='ron.weasley@hogwarts' />
            <FieldError match>That owl address is not registered with the Owl Office.</FieldError>
          </Field>
        ) : (
          <Input
            aria-label={`Seal ${state}`}
            placeholder='Sealed by the Ministry'
            disabled={state === 'disabled'}
          />
        )
      }
    </Axis>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('textbox', { name: 'Seal disabled' })
    await expect(disabled).toBeDisabled()
    await expectDisabledLook(disabled, { text: true, edge: true })
    await userEvent.type(disabled, 'alohomora')
    await expect(disabled).toHaveValue('')

    const invalid = canvas.getByRole('textbox', { name: 'Owl post address' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
  }
}

export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <div {...stylex.props(styles.field)}>
      <label htmlFor='input-with-label-email' {...stylex.props(styles.label)}>
        Owl post address
      </label>
      <Input id='input-with-label-email' placeholder='luna.lovegood@ravenclaw.edu' type='email' />
    </div>
  )
}

export const File: Story = {
  name: 'File',
  render: () => (
    <Field style={styles.narrow}>
      <FieldLabel htmlFor='input-file-picture'>Chocolate Frog card</FieldLabel>
      <Input id='input-file-picture' type='file' />
    </Field>
  )
}

export const WithButton: Story = {
  name: 'With button',
  render: () => (
    <Field style={styles.wrap}>
      <FieldLabel htmlFor='input-with-button-search'>Hogwarts archives</FieldLabel>
      <div {...stylex.props(styles.row)}>
        <Input id='input-with-button-search' placeholder='Search the restricted section…' />
        <Button type='submit'>Accio</Button>
      </div>
    </Field>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByPlaceholderText('Search the restricted section…')
    await userEvent.type(el, 'plexiglass')
    await expect(el).toHaveValue('plexiglass')
    await expect(canvas.getByRole('button', { name: 'Accio' })).toBeEnabled()
  }
}

/** Tab reaches an input and typing fills it; Tab skips a disabled input, and Shift + Tab walks back. */
export const Keyboard: Story = {
  render: () => (
    <div {...stylex.props(styles.field)}>
      <Input aria-label='Spell' placeholder='Spell' />
      <Input aria-label='Sealed' placeholder='Sealed by the Ministry' disabled />
      <Input aria-label='Counter-spell' placeholder='Counter-spell' />
    </div>
  ),
  play: async ({ canvas }) => {
    const spell = canvas.getByRole('textbox', { name: 'Spell' })
    const sealed = canvas.getByRole('textbox', { name: 'Sealed' })
    const counter = canvas.getByRole('textbox', { name: 'Counter-spell' })

    await userEvent.tab()
    await expect(spell).toHaveFocus()
    await userEvent.keyboard('lumos')
    await expect(spell).toHaveValue('lumos')

    await userEvent.tab()
    await expect(sealed).not.toHaveFocus()
    await expect(counter).toHaveFocus()

    await userEvent.tab({ shift: true })
    await expect(spell).toHaveFocus()
  }
}
