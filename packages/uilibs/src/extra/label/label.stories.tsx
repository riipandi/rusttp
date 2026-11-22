import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, userEvent } from 'storybook/test'
import { Checkbox } from '../../base/checkbox'
import { Label } from './label.component'

const meta = {
  title: 'Extra Components/Label',
  component: Label,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Label>

type Story = StoryObj<typeof meta>

export default meta

export const Playground: Story = {
  render: () => (
    <Label>
      <Checkbox aria-label='Accept the Hogwarts letter' /> Accept the Hogwarts letter and its terms
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
