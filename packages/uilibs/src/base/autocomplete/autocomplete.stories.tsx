import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { Field, FieldError, FieldLabel } from '../field'
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList
} from './autocomplete.component'

const meta = {
  title: 'Base Components/Autocomplete',
  component: Autocomplete,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Autocomplete>

type Story = StoryObj<typeof meta>

const tags = [
  'Expelliarmus',
  'Expecto Patronum',
  'Lumos',
  'Alohomora',
  'Accio',
  'Wingardium Leviosa',
  'Riddikulus',
  'Obliviate'
]

const countries = [
  'Paris',
  'Rome',
  'Florence',
  'Venice',
  'Geneva',
  'Cambridge',
  'Boston',
  'Seville'
]

export default meta

type PlaygroundArgs = ComponentProps<typeof Autocomplete> &
  Pick<ComponentProps<typeof AutocompleteInput>, 'size' | 'variant'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['size', 'variant', 'disabled', 'autoHighlight'] }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    disabled: { control: 'boolean' },
    autoHighlight: { control: 'boolean' }
  },
  args: { items: tags, size: 'md', variant: 'outline', disabled: false, autoHighlight: false },
  render: ({ size, variant, ...args }) => (
    <Autocomplete {...args}>
      <AutocompleteInput size={size} variant={variant} placeholder='Search spells…' />
      <AutocompleteContent>
        <AutocompleteEmpty>No spells found.</AutocompleteEmpty>
        <AutocompleteList>
          {(tag) => (
            <AutocompleteItem key={tag} value={tag}>
              {tag}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const input = canvas.getByPlaceholderText('Search spells…')

    // Typing filters the suggestion list.
    await userEvent.type(input, 'lumos')
    await waitFor(() => expect(body.getByText('Lumos')).toBeInTheDocument())

    // Selecting a suggestion fills the free-text input.
    await userEvent.click(body.getByText('Lumos'))
    await waitFor(() => expect(input).toHaveValue('Lumos'))

    // No match renders the empty message.
    await userEvent.clear(input)
    await userEvent.type(input, 'hocuspocus')
    await waitFor(() => expect(body.getByText('No spells found.')).toBeInTheDocument())
  }
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => (
        <Autocomplete items={['Hogwarts', 'Beauxbatons']}>
          <AutocompleteInput
            variant={variant}
            aria-label={`School ${variant}`}
            placeholder='School'
          />
        </Autocomplete>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <Autocomplete items={['Hogwarts', 'Beauxbatons']}>
          <AutocompleteInput size={size} aria-label={`School ${size}`} placeholder='School' />
        </Autocomplete>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement)
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) => (
        <Autocomplete items={tags} disabled={state === 'disabled'}>
          {state === 'invalid' ? (
            <Field invalid>
              <FieldLabel>Spell</FieldLabel>
              <AutocompleteInput placeholder='Search spells…' />
              <FieldError match>Name a spell from the Restricted Section.</FieldError>
            </Field>
          ) : (
            <AutocompleteInput aria-label={`Spell ${state}`} placeholder='Sealed by the Ministry' />
          )}
          <AutocompleteContent>
            <AutocompleteEmpty>No spells found.</AutocompleteEmpty>
            <AutocompleteList>
              {(tag) => (
                <AutocompleteItem key={tag} value={tag}>
                  {tag}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('combobox', { name: 'Spell disabled' })
    await expect(disabled).toBeDisabled()
    await expectDisabledLook(disabled)
    await userEvent.type(disabled, 'lumos')
    await expect(disabled).toHaveValue('')

    const invalid = canvas.getByRole('combobox', { name: 'Spell' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
    await expect(invalid).toHaveAccessibleDescription('Name a spell from the Restricted Section.')
  }
}

export const AutoHighlight: Story = {
  args: { items: countries, autoHighlight: true },
  render: (args) => (
    <Autocomplete {...args}>
      <AutocompleteInput placeholder='Search cities…' />
      <AutocompleteContent>
        <AutocompleteEmpty>No cities found.</AutocompleteEmpty>
        <AutocompleteList>
          {(country) => (
            <AutocompleteItem key={country} value={country}>
              {country}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}
