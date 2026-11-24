import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { ComponentProps } from 'react'
import { expect, userEvent } from 'storybook/test'
import { Checkbox } from '../../base/checkbox'
import { Label } from './label.component'

const meta = {
  title: 'Extra Components/Label',
  component: Label,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Label>

export default meta

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
