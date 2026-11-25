import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent } from 'storybook/test'
import { Checkbox } from '../../base/checkbox'
import { Field, FieldLabel } from '../../base/field'
import { colors } from '../../styles/colors.stylex'
import { Label } from './label.component'

const meta = {
  title: 'Extra Components/Label',
  component: Label,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Label>

export default meta

const styles = stylex.create({
  criticalProbe: {
    color: colors.foregroundCritical
  }
})

// A label has no props of its own, so the control is the text it names.
type PlaygroundArgs = ComponentProps<typeof Label> & { label: string }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['label'] } },
  argTypes: {
    label: { control: 'text' }
  },
  args: { label: 'Accept the Hogwarts letter and its terms' },
  render: ({ label, ...args }) => (
    <Label {...args}>
      <Checkbox aria-label='Accept the Hogwarts letter' /> {label}
    </Label>
  ),
  // Clicking the label toggles the associated control.
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { name: /Accept the Hogwarts letter/ })
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(canvas.getByText(/hogwarts letter and its terms/i))
    await expect(checkbox).toHaveAttribute('aria-checked', 'true')
  }
}

/** A label outside a `Field` has the look of `FieldLabel`, and turns critical with `data-invalid`. */
export const Invalid: StoryObj = {
  render: () => (
    <div>
      <span data-testid='critical' {...stylex.props(styles.criticalProbe)} />
      <Label htmlFor='owl-name'>Owl name</Label>
      <Label htmlFor='owl-name' data-invalid>
        Owl name, invalid
      </Label>
      <Field>
        <FieldLabel>Field label</FieldLabel>
      </Field>
    </div>
  ),
  play: async ({ canvas }) => {
    const critical = getComputedStyle(canvas.getByTestId('critical')).color
    const label = getComputedStyle(canvas.getByText('Owl name'))
    const invalid = getComputedStyle(canvas.getByText('Owl name, invalid'))
    await expect(invalid.color).toBe(critical)
    await expect(label.color).not.toBe(critical)

    const field = getComputedStyle(canvas.getByText('Field label'))
    for (const property of ['fontSize', 'fontWeight', 'display', 'gap', 'userSelect'] as const) {
      await expect(label[property]).toBe(field[property])
    }
    // It shrinks to its text like `FieldLabel`, so the space beside it does not toggle a control.
    await expect(canvas.getByText('Owl name').getBoundingClientRect().width).toBeLessThan(
      canvas.getByText('Owl name').parentElement?.getBoundingClientRect().width ?? 0
    )
  }
}
