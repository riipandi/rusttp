import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
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
import { container, unit } from '../../styles/tokens.stylex'
import { fontFamily, fontSize, fontLineHeight, fontWeight } from '../../styles/tokens.stylex'
import { Textarea } from './textarea.component'

const meta = {
  title: 'Extra Components/Textarea',
  component: Textarea,
  argTypes: {
    disabled: { control: 'boolean' }
  },
  tags: [] // ['autodocs']
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
  render: () => (
    <div {...stylex.props(styles.wrap)}>
      <Textarea placeholder='Draft your letter to the Daily Prophet…' />
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
  render: () => (
    <Axis axis='variant' rows={controlVariantNames}>
      {(variant) => <Textarea variant={variant} rows={1} aria-label={`Prophecy ${variant}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlVariants(canvasElement)
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={controlSizeNames}>
      {(size) => <Textarea size={size} rows={1} aria-label={`Prophecy ${size}`} />}
    </Axis>
  ),
  // A textarea is not one line: its sizes are minimum heights.
  play: async ({ canvasElement }) => expectControlHeights(canvasElement, { sm: 56, md: 64, lg: 72 })
}

export const States: Story = {
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
    await expectDisabledLook(disabled)
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
  }
}
