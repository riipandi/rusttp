import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent } from 'storybook/test'
import { Checkbox } from '../../base/checkbox'
import { Field, FieldLabel } from '../../base/field'
import { Input } from '../../base/input'
import { colors } from '../../styles/colors.stylex'
import { Label } from './label.component'

const meta = {
  title: 'Extra Components/Label',
  component: Label
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
  parameters: {
    docs: {
      source: {
        code: `<Label>
  <Checkbox aria-label='Accept the Hogwarts letter' /> Accept the Hogwarts letter and its terms
</Label>`
      }
    },
    controls: { disable: false, include: ['label'] }
  },
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
  parameters: {
    docs: { source: { code: `<Label htmlFor='owl-name' data-invalid>Owl name, invalid</Label>` } }
  },
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

/** `render` swaps the `label` for a `span` that names a group through `aria-labelledby`. */
export const AsElement: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `<Label render={<span id='house-label' />}>Houses</Label>

<div role='group' aria-labelledby='house-label'>
  <Checkbox aria-label='Gryffindor' />
  <Checkbox aria-label='Ravenclaw' />
</div>`
      }
    }
  },
  name: 'As another element',
  render: () => (
    <div>
      <Label render={<span id='house-label' />}>Houses</Label>
      <Label>Plain</Label>
      <div role='group' aria-labelledby='house-label'>
        <Checkbox aria-label='Gryffindor' />
        <Checkbox aria-label='Ravenclaw' />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Houses' })
    const label = canvas.getByText('Houses')
    await expect(label.tagName).toBe('SPAN')
    await expect(group).toBeInTheDocument()
    // The span wears the label's look: the same type as a plain `Label`.
    const plain = getComputedStyle(canvas.getByText('Plain'))
    await expect(getComputedStyle(label).fontSize).toBe(plain.fontSize)
    await expect(getComputedStyle(label).fontWeight).toBe(plain.fontWeight)
  }
}

/** `htmlFor` names a control the label does not wrap, so a click on the text focuses it. */
export const ForInput: StoryObj = {
  name: 'Point at a control',
  parameters: {
    docs: {
      source: {
        code: `<Label htmlFor='owl-name'>Owl name</Label>
<Input id='owl-name' placeholder='Hedwig' />`
      }
    }
  },
  render: () => (
    <div>
      <Label htmlFor='owl-name'>Owl name</Label>
      <Input id='owl-name' placeholder='Hedwig' />
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Owl name')
    await expect(input).toHaveAttribute('id', 'owl-name')
    await userEvent.click(canvas.getByText('Owl name'))
    await expect(input).toHaveFocus()
  }
}
