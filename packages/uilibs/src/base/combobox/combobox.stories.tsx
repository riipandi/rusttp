import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  controlHeights,
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { Field, FieldError, FieldLabel } from '../field'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue
} from './combobox.component'

const meta = {
  title: 'Base Components/Combobox',
  component: Combobox,
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    autoHighlight: { control: 'boolean' }
  },
  tags: [] // ['autodocs']
} satisfies Meta<typeof Combobox>

type Story = StoryObj<typeof meta>

const comboboxParts = ['input', 'trigger', 'chips'] as const

const frameworks = ['Hogwarts', 'Beauxbatons', 'Durmstrang', 'Ilvermorny', 'Uagadou']

const fruits = ['Butterbeer', 'Pumpkin Juice', 'Firewhisky', 'Gillywater', 'Dandelion Wine']

const produce = [
  { label: 'Louvre', items: ['Mona Lisa', 'Venus de Milo', 'Vitruvian Man'] },
  { label: 'Vatican', items: ['Sistine Chapel', "St. Peter's Basilica", 'Papal Archives'] }
]

interface Framework {
  label: string
  value: string
  description: string
}

const typedFrameworks: Framework[] = [
  { label: 'Robert Langdon', value: 'langdon', description: 'Harvard professor of symbology' },
  { label: 'Sophie Neveu', value: 'neveu', description: 'Cryptographer with the Paris police' },
  { label: 'Vittoria Vetra', value: 'vetra', description: 'Physicist working at CERN' }
]

const styles = stylex.create({
  input: {
    paddingBlock: 4,
    paddingInline: 4,
    width: '100%'
  },
  row: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: 14
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: 12
  }
})

export default meta

export const Playground: Story = {
  args: { items: frameworks },
  render: (args) => (
    <Combobox {...args}>
      <ComboboxInput placeholder='Search school…' />
      <ComboboxContent>
        <ComboboxEmpty>No school found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const input = canvas.getByPlaceholderText('Search school…')

    // Typing opens the popup with filtered options.
    await userEvent.type(input, 'hog')
    const options = await body.findAllByRole('option')
    const target = options[0]
    if (!target) throw new Error('No filtered options found')
    await expect(options.length).toBe(1)
    await expect(target).toHaveTextContent('Hogwarts')

    // Selecting fills the input and closes the popup.
    await userEvent.click(target)
    await waitFor(() => expect(input).toHaveValue('Hogwarts'))
  }
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => (
        <Combobox items={frameworks}>
          <ComboboxInput variant={variant} aria-label={`School ${variant}`} placeholder='School' />
        </Combobox>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectControlVariants(canvasElement, (cell) => cell.querySelector('input'))
}

/** The three boxes of a combobox, in every size: the input, the trigger, and the chips. */
export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames} columnAxis='part' columns={comboboxParts} fill>
      {(size, part) =>
        part === 'input' ? (
          <Combobox items={frameworks}>
            <ComboboxInput size={size} aria-label={`School ${size}`} placeholder='School' />
          </Combobox>
        ) : part === 'trigger' ? (
          <Combobox items={frameworks}>
            <ComboboxTrigger size={size} aria-label={`School trigger ${size}`}>
              School
            </ComboboxTrigger>
          </Combobox>
        ) : (
          <Combobox items={frameworks} multiple>
            <ComboboxChips size={size}>
              <ComboboxChipsInput aria-label={`Schools ${size}`} placeholder='Schools' />
            </ComboboxChips>
          </Combobox>
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const part of comboboxParts) {
      await expectControlHeights(canvasElement, controlHeights, `[data-part="${part}"]`)
    }
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel>School</FieldLabel>
            <Combobox items={frameworks}>
              <ComboboxInput placeholder='Choose a school' />
              <ComboboxContent>
                <ComboboxEmpty>No school found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FieldError match>Pick the school that sent your letter.</FieldError>
          </Field>
        ) : (
          <Combobox items={frameworks} disabled={state === 'disabled'}>
            <ComboboxInput aria-label={`School ${state}`} placeholder='Search school…' />
            <ComboboxContent>
              <ComboboxEmpty>No school found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        )
      }
    </Axis>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('combobox', { name: 'School disabled' })
    await expect(disabled).toBeDisabled()
    await expectDisabledLook(disabled)
    await userEvent.click(disabled)
    await expect(within(document.body).queryByRole('option')).toBeNull()

    const invalid = canvas.getByRole('combobox', { name: 'School' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
    await expect(invalid).toHaveAccessibleDescription('Pick the school that sent your letter.')
  }
}

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['Hogwarts'])
    const anchorRef = React.useRef<HTMLDivElement>(null)

    return (
      <Combobox items={frameworks} multiple value={value} onValueChange={setValue}>
        <ComboboxChips ref={anchorRef}>
          <ComboboxValue>
            {(items: string[]) =>
              items.map((item) => <ComboboxChip key={item}>{item}</ComboboxChip>)
            }
          </ComboboxValue>
          <ComboboxChipsInput placeholder='Add school…' />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxEmpty>No school found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  },
  // A chip's remove button names the chip it removes.
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Remove Hogwarts' })).toBeInTheDocument()
  }
}

export const Popup: Story = {
  render: () => (
    <Combobox items={fruits}>
      <ComboboxTrigger aria-label='Drink'>
        <ComboboxValue placeholder='Select a drink' />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder='Search drink…' style={styles.input} />
        <ComboboxEmpty>No drink found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const Clear: Story = {
  render: () => (
    <Combobox items={frameworks} defaultValue='Hogwarts'>
      <ComboboxInput showClear placeholder='Search school…' />
      <ComboboxContent>
        <ComboboxEmpty>No school found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText('Search school…')
    await expect(input).toHaveValue('Hogwarts')

    await userEvent.click(canvas.getByRole('button', { name: 'Clear value' }))
    await waitFor(() => expect(input).toHaveValue(''))
  }
}

export const Groups: Story = {
  render: () => (
    <Combobox items={produce}>
      <ComboboxInput placeholder='Search landmark…' />
      <ComboboxContent>
        <ComboboxEmpty>No landmark found.</ComboboxEmpty>
        <ComboboxList>
          {produce.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <ComboboxSeparator />}
              <ComboboxGroup items={group.items}>
                <ComboboxLabel>{group.label}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </React.Fragment>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const CustomItems: Story = {
  name: 'Custom items',
  render: () => (
    <Combobox items={typedFrameworks} itemToStringValue={(framework: Framework) => framework.label}>
      <ComboboxInput placeholder='Search person…' />
      <ComboboxContent>
        <ComboboxEmpty>No person found.</ComboboxEmpty>
        <ComboboxList>
          {(framework) => (
            <ComboboxItem key={framework.value} value={framework}>
              <div {...stylex.props(styles.row)}>
                <span {...stylex.props(styles.title)}>{framework.label}</span>
                <span {...stylex.props(styles.description)}>{framework.description}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const AutoHighlight: Story = {
  name: 'Auto highlight',
  render: () => (
    <Combobox items={frameworks} autoHighlight>
      <ComboboxInput placeholder='Search school…' />
      <ComboboxContent>
        <ComboboxEmpty>No school found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const Keyboard: Story = {
  args: { items: frameworks },
  render: (args) => (
    <Combobox {...args}>
      <ComboboxInput aria-label='School' placeholder='School' />
      <ComboboxContent>
        <ComboboxEmpty>No school found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const input = canvas.getByRole('combobox', { name: 'School' })

    // Tab reaches the input, the arrow opens the list and moves through it, Enter picks.
    await userEvent.tab()
    await expect(input).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await body.findByRole('listbox')
    await userEvent.keyboard('{ArrowDown}')
    const options = await body.findAllByRole('option')
    const highlighted = options.find((option) => option.hasAttribute('data-highlighted'))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    // The highlighted option is the one the input now shows.
    await expect(highlighted).toBeDefined()
    await waitFor(() => expect(input).toHaveValue(highlighted?.textContent ?? ''))
    await expect(input).not.toHaveValue('')
  }
}

export const TranslatedChip: Story = {
  render: () => (
    <Combobox items={frameworks} multiple defaultValue={['Hogwarts']}>
      <ComboboxChips>
        <ComboboxValue>
          {(items: string[]) =>
            items.map((item) => (
              <ComboboxChip key={item} labels={{ remove: (text) => `Hapus ${text ?? ''}`.trim() }}>
                {item}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label='Sekolah' />
      </ComboboxChips>
    </Combobox>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Hapus Hogwarts' })).toBeInTheDocument()
  }
}
