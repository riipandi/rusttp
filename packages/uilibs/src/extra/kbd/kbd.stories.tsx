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
  parameters: {
    docs: {
      source: {
        code: `<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>`
      }
    }
  },
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}

export const InTooltip: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant='outline' />}>Alohomora</TooltipTrigger>
    <TooltipContent style={…}>
      Alohomora <Kbd>⌘S</Kbd>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Button variant='outline'>
  Lumos
  <KbdGroup>
    <Kbd>⌘</Kbd>
    <Kbd>S</Kbd>
  </KbdGroup>
</Button>`
      }
    }
  },
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

/** `render` swaps the `kbd` for a link, so a shortcut hint can point at its help page. */
export const AsElement: Story = {
  parameters: { docs: { source: { code: `<Kbd render={<a href='#shortcuts' />}>⌘K</Kbd>` } } },
  name: 'As another element',
  render: () => (
    <>
      <Kbd render={<a href='#shortcuts' />}>⌘K</Kbd> <Kbd>⌘J</Kbd>
    </>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '⌘K' })
    await expect(link).toHaveAttribute('href', '#shortcuts')
    // The link wears the key's look: the same fill and corners as a plain `Kbd`.
    const key = getComputedStyle(canvas.getByText('⌘J'))
    await expect(getComputedStyle(link).backgroundColor).toBe(key.backgroundColor)
    await expect(getComputedStyle(link).borderTopLeftRadius).toBe(key.borderTopLeftRadius)
  }
}
