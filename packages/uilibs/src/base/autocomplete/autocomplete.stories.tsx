import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { controlSizeNames, expectControlHeights } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
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
  parameters: { layout: 'centered' },
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

export const Playground: Story = {
  args: { items: tags },
  render: (args) => (
    <Autocomplete {...args}>
      <AutocompleteInput placeholder='Search spells…' />
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

export const ControlSizes: Story = {
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

export const Invalid: Story = {
  args: { items: tags },
  render: (args) => (
    <Field invalid>
      <FieldLabel>Spell</FieldLabel>
      <Autocomplete {...args}>
        <AutocompleteInput placeholder='Search spells…' />
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
      <FieldError match>Name a spell from the Restricted Section.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Spell' })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('data-invalid')
    await expect(input).toHaveAccessibleDescription('Name a spell from the Restricted Section.')
  }
}

export const Disabled: Story = {
  args: { items: tags, disabled: true },
  render: (args) => (
    <Autocomplete {...args}>
      <AutocompleteInput aria-label='Spell' placeholder='Sealed by the Ministry' />
      <AutocompleteContent>
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
    const input = canvas.getByRole('combobox', { name: 'Spell' })
    await expect(input).toBeDisabled()
    await userEvent.type(input, 'lumos')
    await expect(input).toHaveValue('')
  }
}
