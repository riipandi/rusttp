import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
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
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { container } from '../../styles/tokens.stylex'
import { InputPhone } from './input-phone.component'

const meta = {
  title: 'Extra Components/InputPhone',
  component: InputPhone,
  tags: [] // ['autodocs']
} satisfies Meta<typeof InputPhone>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: container.medium
  },
  wrap: {
    width: container.medium
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: ['size', 'variant', 'disabled', 'invalid', 'readOnly', 'withCountrySelect']
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    withCountrySelect: { control: 'boolean' }
  },
  args: {
    size: 'md',
    variant: 'outline',
    disabled: false,
    invalid: false,
    readOnly: false,
    withCountrySelect: true
  },
  render: (args) => (
    <div {...stylex.props(styles.wrap)}>
      <InputPhone aria-label='Phone number' {...args} />
    </div>
  )
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => <InputPhone variant={variant} aria-label={`Phone ${variant}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => <InputPhone size={size} aria-label={`Phone ${size}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'readOnly', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel htmlFor='phone-invalid'>Emergency contact</FieldLabel>
            <InputPhone
              id='phone-invalid'
              defaultCountry='US'
              placeholder='(555) 000-0000'
              invalid
            />
            <FieldError>Enter a valid phone number.</FieldError>
          </Field>
        ) : (
          <InputPhone
            aria-label={`Owl line ${state}`}
            defaultCountry='US'
            {...(state === 'readOnly'
              ? { value: '+12135551234', onChange: () => {}, readOnly: true }
              : { placeholder: '(555) 013-1692', disabled: state === 'disabled' })}
          />
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const input = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelector('input[type="tel"]')
      if (!el) throw new Error(`No phone input for ${state}`)
      return el
    }
    const disabled = input('disabled')
    await expect(disabled).toBeDisabled()
    await userEvent.type(disabled, '123')
    await expect(disabled).toHaveValue('')
    const group = disabled.closest('[role="group"]')
    if (!group) throw new Error('No phone group')
    await expectDisabledLook(group, { cursor: false })

    const readOnly = input('readOnly')
    await expect(readOnly).toHaveAttribute('readonly')
    await expect(readOnly).toHaveValue('+1 213 555 1234')

    await expect(
      cellOf(canvasElement, 'state', 'invalid').querySelector('[data-invalid]')
    ).not.toBeNull()
  }
}

export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <Field style={styles.field}>
      <FieldLabel htmlFor='phone-labeled'>Owl office hotline</FieldLabel>
      <InputPhone id='phone-labeled' defaultCountry='GB' placeholder='020 7946 0958' />
    </Field>
  )
}

export const International: Story = {
  name: 'International option',
  render: () => (
    <div {...stylex.props(styles.wrap)}>
      <InputPhone defaultCountry='ID' placeholder='812 3456 7890' />
    </div>
  )
}

export const RestrictedCountries: Story = {
  name: 'Restricted countries',
  render: () => (
    <div {...stylex.props(styles.wrap)}>
      <InputPhone countries={['ID', 'SG', 'MY']} defaultCountry='ID' placeholder='812 3456 7890' />
    </div>
  )
}

export const WithDefaultValue: Story = {
  name: 'With default value',
  render: () => (
    <div {...stylex.props(styles.wrap)}>
      <InputPhone aria-label='Phone number' value='+12135551234' onChange={() => {}} />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('textbox')
    await expect(el).toHaveValue('+1 213 555 1234')
  }
}

export const WithoutCountry: Story = {
  name: 'Without country',
  render: () => (
    <Field style={styles.field}>
      <FieldLabel htmlFor='phone-no-country'>Ministry hotline</FieldLabel>
      <InputPhone id='phone-no-country' withCountrySelect={false} placeholder='(555) 123-4567' />
    </Field>
  ),
  play: async ({ canvas }) => {
    // No flag button rendered; the digits span the whole group.
    await expect(canvas.queryByRole('combobox')).toBeNull()
  }
}

/** The country button is named for the country it shows, and its flag carries the full name. */
export const CountryNames: Story = {
  name: 'Country names',
  render: () => (
    <div {...stylex.props(styles.field)}>
      <InputPhone aria-label='Phone number' defaultCountry='US' />
      <InputPhone
        aria-label='Nomor telepon'
        defaultCountry='ID'
        labels={{ selectCountry: (country) => `Pilih negara, ${country}` }}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const us = canvas.getByRole('combobox', { name: 'Select country, United States' })
    await expect(us.querySelector('svg title')).toHaveTextContent('United States')
    const id = canvas.getByRole('combobox', { name: 'Pilih negara, Indonesia' })
    await expect(id.querySelector('svg title')).toHaveTextContent('Indonesia')
  }
}

export const Interaction: Story = {
  render: () => (
    <div {...stylex.props(styles.wrap)}>
      <InputPhone id='phone-typing' aria-label='Phone number' defaultCountry='US' />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('textbox')
    await userEvent.type(el, '2135551234')
    await expect(el).toHaveValue('(213) 555-1234')
  }
}
