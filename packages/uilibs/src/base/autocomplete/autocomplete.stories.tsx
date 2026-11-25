import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook,
  expectHighlightedItem
} from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
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

// The look lives on `AutocompleteInput` and the placement on `AutocompleteContent`.
type PlaygroundArgs = ComponentProps<typeof Autocomplete> &
  Pick<ComponentProps<typeof AutocompleteInput>, 'size' | 'variant'> &
  Pick<ComponentProps<typeof AutocompleteContent>, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'size',
        'variant',
        'disabled',
        'autoHighlight',
        'side',
        'sideOffset',
        'align',
        'alignOffset'
      ]
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    disabled: { control: 'boolean' },
    autoHighlight: { control: 'boolean' },
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' }
  },
  args: {
    items: tags,
    size: 'medium',
    variant: 'outline',
    disabled: false,
    autoHighlight: false,
    side: 'bottom',
    sideOffset: 6,
    align: 'start',
    alignOffset: 0
  },
  render: ({ size, variant, side, sideOffset, align, alignOffset, ...args }) => (
    <Autocomplete {...args}>
      <AutocompleteInput size={size} variant={variant} placeholder='Search spells…' />
      <AutocompleteContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
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
  parameters: {
    docs: {
      source: {
        code: `<Autocomplete items={['Hogwarts', 'Beauxbatons']}>
  <AutocompleteInput variant='faded' aria-label='School faded' placeholder='School' />
  <AutocompleteContent>
    <AutocompleteList>
      {(school) => <AutocompleteItem key={school} value={school}>{school}</AutocompleteItem>}
    </AutocompleteList>
  </AutocompleteContent>
</Autocomplete>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Autocomplete items={['Hogwarts', 'Beauxbatons']}>
  <AutocompleteInput size='large' aria-label='School large' placeholder='School' />
  <AutocompleteContent>
    <AutocompleteList>
      {(school) => <AutocompleteItem key={school} value={school}>{school}</AutocompleteItem>}
    </AutocompleteList>
  </AutocompleteContent>
</Autocomplete>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Autocomplete items={spells}>
  <Field invalid>
    <FieldLabel>Spell</FieldLabel>
    <AutocompleteInput placeholder='Search spells…' />
    <FieldError match>Name a spell from the Restricted Section.</FieldError>
  </Field>
  <AutocompleteContent>
    <AutocompleteEmpty>No spells found.</AutocompleteEmpty>
    <AutocompleteList>
      {(spell) => <AutocompleteItem key={spell} value={spell}>{spell}</AutocompleteItem>}
    </AutocompleteList>
  </AutocompleteContent>
</Autocomplete>

// Disabled: <Autocomplete disabled items={spells}>…</Autocomplete>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Autocomplete items={cities} autoHighlight>
  <AutocompleteInput placeholder='Search cities…' />
  <AutocompleteContent>
    <AutocompleteEmpty>No cities found.</AutocompleteEmpty>
    <AutocompleteList>
      {(city) => <AutocompleteItem key={city} value={city}>{city}</AutocompleteItem>}
    </AutocompleteList>
  </AutocompleteContent>
</Autocomplete>`
      }
    }
  },
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

function Spells({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Autocomplete items={tags} defaultOpen={defaultOpen}>
      <AutocompleteInput aria-label='Spell' placeholder='Spell' />
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
  )
}

// The a11y gate runs after `play`, when a popup a play opened has closed again: this story keeps
// the list open so the gate checks it.
export const Open: Story = {
  render: () => <Spells defaultOpen />,
  play: async () => {
    const list = await within(document.body).findByRole('listbox')
    await waitFor(() => expect(list).toBeVisible())
    await expect(within(list).getAllByRole('option')).toHaveLength(tags.length)
  }
}

/** The arrows open the list and move a visible highlight through it, Enter picks, and Escape closes it. */
export const Keyboard: Story = {
  render: () => <Spells />,
  play: async ({ canvas }) => {
    const body = within(document.body)
    const input = canvas.getByRole('combobox', { name: 'Spell' })
    const options = () => body.queryAllByRole('option')
    // `aria-expanded` follows the open state at once; the listbox stays in the page while it fades out.
    const expanded = () => input.getAttribute('aria-expanded') === 'true'
    const index = () => options().findIndex((option) => option.hasAttribute('data-highlighted'))

    await userEvent.tab()
    await expect(input).toHaveFocus()

    // ArrowDown opens the list; a further ArrowDown highlights the first option, then the next.
    await pressUntil('{ArrowDown}', () => expect(body.getByRole('listbox')).toBeVisible(), {
      when: () => !expanded()
    })
    await pressUntil('{ArrowDown}', () => expect(index()).toBeGreaterThanOrEqual(0), {
      when: () => index() < 0
    })
    const first = index()
    await pressUntil('{ArrowDown}', () => expect(index()).toBe(first + 1), {
      when: () => index() === first
    })
    // ArrowUp moves back.
    await pressUntil('{ArrowUp}', () => expect(index()).toBe(first), {
      when: () => index() === first + 1
    })
    await pressUntil('{ArrowDown}', () => expect(index()).toBe(first + 1), {
      when: () => index() === first
    })
    const highlighted = options()[first + 1]!
    await expectHighlightedItem(highlighted, options()[first])

    // Enter fills the input with the highlighted option and closes the list; focus stays in the input.
    const picked = highlighted.textContent ?? ''
    await pressUntil('{Enter}', () => expect(input).toHaveValue(picked), {
      when: expanded
    })
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await expect(input).toHaveFocus()

    // Typing filters the list, and Escape closes it.
    await userEvent.clear(input)
    await userEvent.type(input, 'lum')
    await waitFor(() => expect(options()).toHaveLength(1))
    await pressUntil('{Escape}', () => expect(body.queryByRole('listbox')).toBeNull(), {
      when: expanded
    })
    await expect(input).toHaveFocus()
  }
}
