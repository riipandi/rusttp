import { Sparkles } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  controlSizeNames,
  controlVariantNames,
  expectControlHeights,
  expectControlVariants,
  expectDisabledLook,
  expectGlyphSizes,
  expectHighlightedItem
} from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { gone, untilGone } from '../../contracts/overlay'
import { Axis } from '../../contracts/story-axes'
import { controlSizes, controlVariants } from '../../styles/control.stylex'
import { Field, FieldError, FieldLabel } from '../field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from './select.component'

const meta = {
  title: 'Base Components/Select',
  component: Select,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Select>

type Story = StoryObj<typeof meta>

const fruits = [
  { label: 'Phoenix feather', value: 'phoenix' },
  { label: 'Dragon heartstring', value: 'dragon' },
  { label: 'Unicorn hair', value: 'unicorn' }
]

const groups = [
  {
    label: 'Wand cores',
    items: [
      { label: 'Phoenix feather', value: 'phoenix' },
      { label: 'Dragon heartstring', value: 'dragon' },
      { label: 'Unicorn hair', value: 'unicorn' }
    ]
  },
  {
    label: 'Potion ingredients',
    items: [
      { label: 'Bezoar', value: 'bezoar' },
      { label: 'Asphodel', value: 'asphodel' },
      { label: 'Wormwood', value: 'wormwood' }
    ]
  }
]

const items = groups.flatMap((group) => group.items)

const timezones = [
  'UTC-08:00 Salem',
  'UTC-07:00 Denver',
  'UTC-06:00 Mexico City',
  'UTC-05:00 Boston',
  'UTC-03:00 Buenos Aires',
  'UTC+00:00 London',
  'UTC+01:00 Paris',
  'UTC+01:00 Geneva',
  'UTC+02:00 Athens',
  'UTC+03:00 Istanbul',
  'UTC+04:00 Dubai',
  'UTC+05:30 Mumbai',
  'UTC+07:00 Bangkok',
  'UTC+08:00 Singapore',
  'UTC+09:00 Tokyo',
  'UTC+12:00 Auckland'
].map((label) => ({ label, value: label }))

const plansWithOptions = [
  { label: 'Muggle', value: 'free' },
  { label: 'Prefect', value: 'pro' },
  { label: 'Ministry of Magic (contact us)', value: 'enterprise', disabled: true }
]

const invalidPlans = [
  { label: 'Muggle', value: 'free' },
  { label: 'Prefect', value: 'pro' },
  { label: 'Ministry of Magic', value: 'enterprise' }
]

export default meta

// The look lives on the trigger and the placement on the content.
type PlaygroundArgs = ComponentProps<typeof Select> &
  Pick<ComponentProps<typeof SelectTrigger>, 'size' | 'variant'> &
  Pick<
    ComponentProps<typeof SelectContent>,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'alignItemWithTrigger'
  >

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'size',
        'variant',
        'side',
        'sideOffset',
        'align',
        'alignOffset',
        'alignItemWithTrigger',
        'disabled'
      ]
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' },
    alignItemWithTrigger: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    items: fruits,
    size: 'medium',
    variant: 'outline',
    side: 'bottom',
    sideOffset: 4,
    align: 'center',
    alignOffset: 0,
    alignItemWithTrigger: false,
    disabled: false
  },
  render: ({
    size,
    variant,
    side,
    sideOffset,
    align,
    alignOffset,
    alignItemWithTrigger,
    ...args
  }) => (
    <Select {...args}>
      <SelectTrigger size={size} variant={variant} aria-label='Wand core'>
        <SelectValue placeholder='Select a wand core' />
      </SelectTrigger>
      <SelectContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        {fruits.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const trigger = canvas.getByText('Select a wand core')

    // Opening lists every wand core.
    await userEvent.click(trigger)
    const listbox = await body.findByRole('listbox')
    await expect(body.getAllByRole('option').length).toBe(3)

    // Selecting updates the trigger and closes the popup.
    await userEvent.click(within(listbox).getByRole('option', { name: 'Dragon heartstring' }))
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await expect(canvas.getByText('Dragon heartstring')).toBeInTheDocument()

    // Escape dismisses without changing the value.
    await userEvent.click(trigger)
    await body.findByRole('listbox')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await expect(canvas.getByText('Dragon heartstring')).toBeInTheDocument()
  }
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select items={wandCores}>
  <SelectTrigger variant='faded' aria-label='Wand core'>
    <SelectValue placeholder='Wand core' />
  </SelectTrigger>
  <SelectContent>
    {wandCores.map(({ label, value }) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => (
        <Select items={fruits}>
          <SelectTrigger variant={variant} aria-label={`Wand core ${variant}`}>
            <SelectValue placeholder='Wand core' />
          </SelectTrigger>
        </Select>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

/** A glyph before the value: decoration only, so the trigger keeps its name and the chevron stays at the edge. */
export const Icons: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select items={wandCores} defaultValue='phoenix'>
  <SelectTrigger icon={Sparkles} aria-label='Wand core'>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {wandCores.map(({ label, value }) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>`
      }
    }
  },
  render: () => (
    <Axis axis='icon' rows={['none', 'leading'] as const}>
      {(icon) => (
        <Select items={fruits} defaultValue='phoenix'>
          <SelectTrigger
            icon={icon === 'leading' ? Sparkles : undefined}
            aria-label={`Wand core ${icon}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fruits.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Wand core leading' })
    const glyph = trigger.querySelector('svg')
    if (!glyph) throw new Error('No glyph')
    await expect(glyph).toHaveAttribute('aria-hidden', 'true')
    // The name is the label alone, and the glyph comes before the value text.
    await expect(trigger).toHaveAccessibleName('Wand core leading')
    const value = within(trigger).getByText('Phoenix feather').getBoundingClientRect()
    await expect(glyph.getBoundingClientRect().right).toBeLessThan(value.left)
    // The chevron is still the last thing in the trigger, on the trailing edge.
    const chevron = Array.from(trigger.querySelectorAll('svg')).at(-1)
    await expect(chevron).not.toBe(glyph)
    await expect(
      Math.round(
        trigger.getBoundingClientRect().right - (chevron?.getBoundingClientRect().right ?? 0)
      )
    ).toBeLessThan(16)
    // Same height with or without the glyph.
    const plain = canvas.getByRole('combobox', { name: 'Wand core none' })
    await expect(trigger.getBoundingClientRect().height).toBe(plain.getBoundingClientRect().height)

    // The glyph does not block opening: a press on it opens the list (the keyboard is covered by
    // the `Keyboard` story).
    await userEvent.click(glyph)
    await within(document.body).findByRole('listbox')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull())
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select items={wandCores}>
  <SelectTrigger size='large' aria-label='Wand core'>
    <SelectValue placeholder='Wand core' />
  </SelectTrigger>
  <SelectContent>
    {wandCores.map(({ label, value }) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => (
        <Select items={fruits}>
          <SelectTrigger size={size} aria-label={`Wand core ${size}`}>
            <SelectValue placeholder='Wand core' />
          </SelectTrigger>
        </Select>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    await expectControlHeights(canvasElement)
    await expectGlyphSizes(canvasElement, controlSizeNames)
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel htmlFor='select-invalid-plan'>Gringotts plan</FieldLabel>
            <Select items={invalidPlans}>
              <SelectTrigger id='select-invalid-plan'>
                <SelectValue placeholder='Select a Gringotts plan' />
              </SelectTrigger>
              <SelectContent>
                {invalidPlans.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError match>Please select a Gringotts plan to continue.</FieldError>
          </Field>
        ) : (
          <Select items={fruits} disabled={state === 'disabled'}>
            <SelectTrigger aria-label={`Wand core ${state}`}>
              <SelectValue placeholder='Wand core' />
            </SelectTrigger>
            <SelectContent>
              {fruits.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
    </Axis>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('combobox', { name: 'Wand core disabled' })
    await expect(disabled).toBeDisabled()
    await expectDisabledLook(disabled, { text: true, edge: true })
    // A disabled trigger is out of the tab order.
    await userEvent.tab()
    await expect(disabled).not.toHaveFocus()

    const invalid = canvas.getByRole('combobox', { name: 'Gringotts plan' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
  }
}

export const Groups: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select items={ingredients}>
  <SelectTrigger aria-label='Ingredient'>
    <SelectValue placeholder='Select an ingredient' />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Wand cores</SelectLabel>
      <SelectItem value='phoenix'>Phoenix feather</SelectItem>
      <SelectItem value='dragon'>Dragon heartstring</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectSeparator />
      <SelectLabel>Potion ingredients</SelectLabel>
      <SelectItem value='bezoar'>Bezoar</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`
      }
    }
  },
  args: { items },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label='Ingredient'>
        <SelectValue placeholder='Select an ingredient' />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group, index) => (
          <SelectGroup key={group.label}>
            {index > 0 && <SelectSeparator />}
            <SelectLabel>{group.label}</SelectLabel>
            {group.items.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

export const Scrollable: Story = {
  args: { items: timezones },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label='City'>
        <SelectValue placeholder='Select a city' />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger>
        {timezones.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const DisabledOptions: Story = {
  name: 'Disabled options',
  args: { items: plansWithOptions, defaultValue: 'pro' },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label='Wand core'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {plansWithOptions.map(({ label, value, disabled }) => (
          <SelectItem key={value} value={value} disabled={disabled}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function WandCores({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Select items={fruits} defaultOpen={defaultOpen}>
      <SelectTrigger aria-label='Wand core'>
        <SelectValue placeholder='Select a wand core' />
      </SelectTrigger>
      <SelectContent>
        {fruits.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// The a11y gate runs after `play`, when a list a play opened has closed again: this story keeps
// the list open so the gate checks it.
export const Open: Story = {
  render: () => <WandCores defaultOpen />,
  play: async () => {
    const list = await within(document.body).findByRole('listbox')
    await waitFor(() => expect(list).toBeVisible())
    await expect(within(list).getAllByRole('option')).toHaveLength(fruits.length)
  }
}

/** Enter, Space, or ArrowDown opens the list; the arrows, Home, End, and typeahead move the highlight; Enter picks and Escape closes. */
export const Keyboard: Story = {
  render: () => <WandCores />,
  play: async ({ canvas }) => {
    const body = within(document.body)
    const trigger = canvas.getByRole('combobox', { name: 'Wand core' })
    const highlightedName = () =>
      body.queryAllByRole('option').find((option) => option.hasAttribute('data-highlighted'))
        ?.textContent ?? null
    const visible = () => expect(body.getByRole('listbox')).toBeVisible()
    const popup = () => body.queryByRole('listbox')

    await userEvent.tab()
    await expect(trigger).toHaveFocus()

    // Each key opens the list only while it is closed, and Escape closes it and returns focus.
    for (const key of ['{Enter}', ' ', '{ArrowDown}']) {
      await pressUntil(key, visible, { when: () => !body.queryByRole('listbox') })
      await pressUntil('{Escape}', gone(popup))
      await waitFor(() => expect(trigger).toHaveFocus())
    }

    // Open it again. Where the highlight starts is not fixed under simulated events (WebKit
    // opens with nothing highlighted), so Home pins it and each arrow's step is the same everywhere.
    await pressUntil('{Enter}', visible, { when: () => !body.queryByRole('listbox') })
    await pressUntil('{Home}', () => expect(highlightedName()).toBe('Phoenix feather'))
    await pressUntil('{ArrowDown}', () => expect(highlightedName()).toBe('Dragon heartstring'), {
      when: () => highlightedName() === 'Phoenix feather'
    })
    await expectHighlightedItem(
      body.getByRole('option', { name: 'Dragon heartstring' }),
      body.getByRole('option', { name: 'Phoenix feather' })
    )
    await pressUntil('{ArrowUp}', () => expect(highlightedName()).toBe('Phoenix feather'), {
      when: () => highlightedName() === 'Dragon heartstring'
    })
    await pressUntil('{End}', () => expect(highlightedName()).toBe('Unicorn hair'))
    await pressUntil('{Home}', () => expect(highlightedName()).toBe('Phoenix feather'))

    // Typing a letter highlights the option that starts with it.
    await pressUntil('d', () => expect(highlightedName()).toBe('Dragon heartstring'))

    // One press: the control that takes it already holds focus (asserted above), and a second press
    // could land on the trigger as focus returns to it and reopen the popup. The popup stays in the
    // page for its exit animation, so the wait is longer on a loaded runner.
    await userEvent.keyboard('{Enter}')
    await untilGone(popup)
    await expect(trigger).toHaveTextContent('Dragon heartstring')
    await expect(trigger).toHaveFocus()
  }
}
