import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { cellOf, expectBoxSizes, expectDisabledLook } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontSize, radius, stroke } from '../../styles/tokens.stylex'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '../field'
import { RadioGroup, RadioGroupItem } from './radio.component'
import { radioSizes } from './radio.stylex'

const meta = {
  title: 'Base Components/Radio',
  component: RadioGroup,
  tags: [] // ['autodocs']
} satisfies Meta<typeof RadioGroup>

type Story = StoryObj<typeof meta>

const options = ['Gryffindor', 'Slytherin', 'Ravenclaw']

const plans = [
  {
    value: 'starter',
    label: 'Owl post plan',
    description: 'Five vault visits a month and standard owl support.'
  },
  {
    value: 'pro',
    label: 'Galleon plan',
    description: 'Unlimited vault visits and priority House-elf support.'
  }
]

const styles = stylex.create({
  label: {
    alignItems: 'center',
    color: colors.foregroundNeutral,
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: 8
  },
  disabled: {
    color: colors.foregroundDisabled
  },
  groupGap4: {
    gap: 16
  },
  groupGap3: {
    gap: 12
  },
  card: {
    alignItems: 'flex-start',
    borderColor: {
      default: colors.borderNeutral,
      ':has([data-checked])': colors.borderPrimary
    },
    borderRadius: radius.large,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    cursor: 'pointer',
    display: 'flex',
    gap: 12,
    padding: 16
  },
  cardItem: {
    marginTop: 4
  }
})

export default meta

type PlaygroundArgs = ComponentProps<typeof RadioGroup> &
  Pick<ComponentProps<typeof RadioGroupItem>, 'size'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['size', 'disabled', 'readOnly'] } },
  argTypes: {
    size: { control: 'radio', options: Object.keys(radioSizes) },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' }
  },
  args: { defaultValue: 'Slytherin', size: 'medium', disabled: false, readOnly: false },
  render: ({ size, ...args }) => (
    <RadioGroup {...args}>
      {options.map((option) => (
        <label key={option} {...stylex.props(styles.label)}>
          <RadioGroupItem value={option} size={size} /> {option}
        </label>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvas }) => {
    const slytherin = canvas.getByRole('radio', { name: 'Slytherin' })
    const ravenclaw = canvas.getByRole('radio', { name: 'Ravenclaw' })

    await expect(slytherin).toHaveAttribute('aria-checked', 'true')

    // Selection is exclusive.
    await userEvent.click(ravenclaw)
    await expect(ravenclaw).toHaveAttribute('aria-checked', 'true')
    await expect(slytherin).toHaveAttribute('aria-checked', 'false')
  }
}

const states = ['default', 'disabled', 'invalid'] as const

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={states}>
      {(state) => {
        const group = (
          <RadioGroup
            defaultValue='a'
            disabled={state === 'disabled'}
            aria-label={`Dossier ${state}`}
          >
            <label {...stylex.props(styles.label, state === 'disabled' && styles.disabled)}>
              <RadioGroupItem value='a' /> Illuminati dossier
            </label>
            <label {...stylex.props(styles.label, state === 'disabled' && styles.disabled)}>
              <RadioGroupItem value='b' /> Priory of Sion dossier
            </label>
          </RadioGroup>
        )
        return state === 'invalid' ? <Field invalid>{group}</Field> : group
      }}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const items = (state: string) =>
      Array.from(cellOf(canvasElement, 'state', state).querySelectorAll('[role="radio"]'))
    for (const item of items('disabled')) {
      await expect(item).toHaveAttribute('data-disabled')
      await expectDisabledLook(item)
    }
    const [first, second] = items('disabled')
    if (!first || !second) throw new Error('Disabled radios not found')
    await userEvent.click(second)
    await expect(second).toHaveAttribute('aria-checked', 'false')
    await expect(first).toHaveAttribute('aria-checked', 'true')

    for (const item of items('invalid')) await expect(item).toHaveAttribute('data-invalid')
    for (const item of items('default')) await expect(item).not.toHaveAttribute('data-invalid')
  }
}

export const Description: Story = {
  args: { defaultValue: 'starter' },
  render: (args) => (
    <RadioGroup {...args} style={styles.groupGap4}>
      {plans.map((plan) => (
        <Field key={plan.value} orientation='horizontal'>
          <RadioGroupItem value={plan.value} id={`radio-group-description-${plan.value}`} />
          <FieldContent>
            <FieldLabel htmlFor={`radio-group-description-${plan.value}`}>{plan.label}</FieldLabel>
            <FieldDescription>{plan.description}</FieldDescription>
          </FieldContent>
        </Field>
      ))}
    </RadioGroup>
  )
}

export const ChoiceCard: Story = {
  name: 'Choice card',
  args: { defaultValue: 'pro' },
  render: (args) => (
    <RadioGroup {...args} style={styles.groupGap3}>
      {plans.map((plan) => (
        <Field key={plan.value} orientation='horizontal'>
          {/* The label is the card, so the whole surface toggles the radio. */}
          <FieldLabel style={styles.card}>
            <RadioGroupItem value={plan.value} style={styles.cardItem} />
            <FieldContent>
              <FieldTitle>{plan.label}</FieldTitle>
              <FieldDescription>{plan.description}</FieldDescription>
            </FieldContent>
          </FieldLabel>
        </Field>
      ))}
    </RadioGroup>
  )
}

export const OnValueChange: StoryObj<{ handleChange: ReturnType<typeof fn> }> = {
  name: 'onValueChange',
  args: { handleChange: fn() },
  render: (args) => (
    <RadioGroup onValueChange={args.handleChange}>
      {options.map((option) => (
        <label key={option} {...stylex.props(styles.label)}>
          <RadioGroupItem value={option} /> {option}
        </label>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Gryffindor' }))
    // onValueChange carries (value, eventDetails) — check the value arg.
    await expect(args.handleChange.mock.calls[0]?.[0]).toBe('Gryffindor')
  }
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={['small', 'medium', 'large'] as const}>
      {(size) => (
        <RadioGroup defaultValue='house' aria-label={`House ${size}`}>
          <label {...stylex.props(styles.label)}>
            <RadioGroupItem value='house' size={size} /> {size}
          </label>
        </RadioGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectBoxSizes(canvasElement, '[role="radio"]', {
      small: [12, 12],
      medium: [16, 16],
      large: [20, 20]
    })
}
