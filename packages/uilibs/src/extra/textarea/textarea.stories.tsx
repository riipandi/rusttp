import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '../../base/field'
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
import { container, unit } from '../../styles/tokens.stylex'
import { fontFamily, fontSize, fontLineHeight, fontWeight } from '../../styles/tokens.stylex'
import { Textarea } from './textarea.component'

const meta = {
  title: 'Extra Components/Textarea',
  component: Textarea
} satisfies Meta<typeof Textarea>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  wrap: {
    maxWidth: '100%',
    width: container.large
  },
  fill: {
    width: '100%'
  },
  counterRow: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between'
  },
  counter: {
    color: colors.foregroundNeutralFaded,
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: fontLineHeight.caption1
  },
  counterNearLimit: {
    color: colors.foregroundWarning
  },
  counterAtLimit: {
    color: colors.foregroundCritical,
    fontWeight: fontWeight.semibold
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: ['placeholder', 'size', 'variant', 'disabled', 'autoResize']
    }
  },
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'radio', options: Object.keys(controlSizes) },
    variant: { control: 'radio', options: Object.keys(controlVariants) },
    disabled: { control: 'boolean' },
    autoResize: { control: 'boolean' }
  },
  args: {
    placeholder: 'Draft your letter to the Daily Prophet…',
    size: 'medium',
    variant: 'outline',
    disabled: false,
    autoResize: false
  },
  render: (args) => (
    <div {...stylex.props(styles.wrap)}>
      <Textarea {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByPlaceholderText('Draft your letter to the Daily Prophet…')
    await userEvent.type(el, 'Dear Editor,')
    await expect(el).toHaveValue('Dear Editor,')
  }
}

/** Every fill of the control; each has the focus ring, only `outline` has the 3:1 edge at rest. */
export const Variants: Story = {
  parameters: {
    docs: { source: { code: `<Textarea variant='faded' rows={1} aria-label='Prophecy faded' />` } }
  },
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => <Textarea variant={variant} rows={1} aria-label={`Prophecy ${variant}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  parameters: {
    docs: { source: { code: `<Textarea size='large' rows={1} aria-label='Prophecy large' />` } }
  },
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => <Textarea size={size} rows={1} aria-label={`Prophecy ${size}`} />}
    </Axis>
  ),
  // A textarea is not one line: its sizes are minimum heights.
  play: async ({ canvasElement }) =>
    expectControlHeights(canvasElement, { small: 56, medium: 64, large: 72 })
}

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Textarea aria-label='Decree disabled' placeholder='Locked by Ministry decree' disabled />

<Field invalid>
  <FieldLabel>Symbologist bio</FieldLabel>
  <Textarea defaultValue='Dear Editor,' />
  <FieldError match>Your letter must be at least 10 characters.</FieldError>
</Field>`
      }
    }
  },
  render: () => (
    <Axis axis='state' rows={['default', 'disabled', 'invalid'] as const}>
      {(state) =>
        state === 'invalid' ? (
          <Field invalid>
            <FieldLabel>Symbologist bio</FieldLabel>
            <Textarea defaultValue='Dear Editor,' />
            <FieldError match>Your letter must be at least 10 characters.</FieldError>
          </Field>
        ) : (
          <Textarea
            aria-label={`Decree ${state}`}
            placeholder='Locked by Ministry decree'
            disabled={state === 'disabled'}
          />
        )
      }
    </Axis>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('textbox', { name: 'Decree disabled' })
    await expect(disabled).toBeDisabled()
    await expectDisabledLook(disabled, { text: true, edge: true })
    await userEvent.type(disabled, 'alohomora')
    await expect(disabled).toHaveValue('')

    const invalid = canvas.getByRole('textbox', { name: 'Symbologist bio' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
    await expect(invalid).toHaveAccessibleDescription('Your letter must be at least 10 characters.')
  }
}

export const WithField: Story = {
  name: 'With field',
  render: () => (
    <Field style={styles.wrap}>
      <FieldLabel>Symbologist bio</FieldLabel>
      <Textarea placeholder='Tell us about your strangest symbol discovery' />
      <FieldDescription>
        You can @mention other wizards and wizarding organizations.
      </FieldDescription>
    </Field>
  )
}

const MAX_CHARS = 280

export const AutoResize: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Field>
  <FieldLabel htmlFor='textarea-auto-resize'>Bio</FieldLabel>
  <Textarea
    id='textarea-auto-resize'
    autoResize
    value={value}
    onChange={(event) => setValue(event.target.value)}
    placeholder='Tell us about yourself...'
    rows={2}
  />
</Field>`
      }
    }
  },
  name: 'Auto Resize',
  render: () => {
    const [value, setValue] = React.useState('')

    const remaining = MAX_CHARS - value.length
    const isNearLimit = remaining <= 20
    const isAtLimit = remaining === 0

    return (
      <div {...stylex.props(styles.wrap)}>
        <Field style={styles.fill}>
          <div {...stylex.props(styles.counterRow)}>
            <FieldLabel htmlFor='textarea-auto-resize'>Bio</FieldLabel>
            <span
              {...stylex.props(
                styles.counter,
                isAtLimit && styles.counterAtLimit,
                isNearLimit && styles.counterNearLimit
              )}
            >
              {value.length}/{MAX_CHARS}
            </span>
          </div>
          <Textarea
            id='textarea-auto-resize'
            autoResize
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, MAX_CHARS))}
            placeholder='Tell us about yourself...'
            rows={2}
          />
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const el = canvas.getByPlaceholderText('Tell us about yourself...')

    // Typing grows the textarea and updates the counter.
    await userEvent.type(el, 'Marauder')
    await expect(canvas.getByText('8/280')).toBeInTheDocument()

    // The counter flips to the warning tone near the limit.
    await userEvent.type(el, 'a'.repeat(20))
    await expect(canvas.getByText('28/280')).toBeInTheDocument()

    // Growing past the minimum height clips no line: the border is part of the box, not of the content.
    await userEvent.type(el, '{Enter}'.repeat(6))
    await expect(el.scrollHeight).toBeLessThanOrEqual(el.clientHeight)
  }
}

const letter =
  'Dear Mr. Potter, we are pleased to inform you that you have been accepted at Hogwarts School of Witchcraft and Wizardry. Please find enclosed a list of all necessary books and equipment. Term begins on 1 September. We await your owl by no later than 31 July.'

/** A `value` set from outside resizes the textarea: no keystroke is needed. */
export const ControlledResize: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Textarea autoResize value={value} onChange={(event) => setValue(event.target.value)} rows={2} />
<Button onClick={() => setValue(letter)}>Fill the letter</Button>`
      }
    }
  },
  name: 'Controlled resize',
  render: () => {
    const [value, setValue] = React.useState('')

    return (
      <div {...stylex.props(styles.wrap)}>
        <Field style={styles.fill}>
          <FieldLabel htmlFor='textarea-controlled-resize'>Acceptance letter</FieldLabel>
          <Textarea
            id='textarea-controlled-resize'
            autoResize
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={2}
          />
        </Field>
        <Button onClick={() => setValue(letter)}>Fill the letter</Button>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const el = canvas.getByRole('textbox', { name: 'Acceptance letter' })
    const before = el.getBoundingClientRect().height

    await userEvent.click(canvas.getByRole('button', { name: 'Fill the letter' }))

    await expect(el).toHaveValue(letter)
    await waitFor(() => expect(el.getBoundingClientRect().height).toBeGreaterThan(before + 20))
    // The box shows the whole letter: nothing scrolls inside it, and no last line is cut off.
    await expect(el.scrollHeight).toBeLessThanOrEqual(el.clientHeight)
  }
}
