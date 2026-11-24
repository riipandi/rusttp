import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../base/tooltip'
import { Kbd, KbdGroup } from './kbd.component'

const meta = {
  title: 'Extra Components/Kbd',
  component: Kbd,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Kbd>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  content: {
    alignItems: 'center',
    display: 'flex',
    gap: 6
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['children'] } },
  argTypes: {
    children: { control: 'text' }
  },
  args: { children: 'P' },
  render: ({ children }) => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>{children}</Kbd>
    </KbdGroup>
  )
}

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}

export const InTooltip: Story = {
  name: 'In a tooltip',
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant='outline' />}>Alohomora</TooltipTrigger>
        <TooltipContent style={styles.content}>
          Alohomora <Kbd>⌘S</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    await userEvent.hover(canvas.getByRole('button', { name: 'Alohomora' }))
    await waitFor(() => expect(body.getByText('⌘S')).toBeVisible())
  }
}

export const InButton: Story = {
  name: 'In a button',
  render: () => (
    <Button variant='outline'>
      Lumos
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>S</Kbd>
      </KbdGroup>
    </Button>
  )
}
