import { AlignCenter, AlignLeft, AlignRight } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import { Button } from '../button'
import { Toggle } from '../toggle'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './toolbar.component'

const meta = {
  title: 'Base Components/Toolbar',
  component: Toolbar,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Toolbar>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 }
})

export default meta

export const Playground: Story = {
  render: () => (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarButton render={<Toggle aria-label='Toggle charm' />}>Charm</ToolbarButton>
        <ToolbarButton render={<Toggle aria-label='Toggle hex' />}>Hex</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton render={<Button variant='ghost' size='sm' />}>Send by Owl</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvas }) => {
    const charm = canvas.getByRole('button', { name: 'Toggle charm' })
    await expect(charm).toHaveAttribute('aria-pressed', 'false')

    // Toggles inside the toolbar keep their own state.
    await userEvent.click(charm)
    await expect(charm).toHaveAttribute('aria-pressed', 'true')

    await expect(canvas.getByRole('separator')).toBeInTheDocument()
  }
}

export const WithToggleGroup: Story = {
  name: 'With a toggle group',
  render: () => (
    <Toolbar>
      <ToggleGroup variant='outline' spacing='joined' defaultValue={['left']}>
        <ToolbarButton render={<ToggleGroupItem value='left' aria-label='Align left' />}>
          <AlignLeft {...stylex.props(styles.icon)} />
        </ToolbarButton>
        <ToolbarButton render={<ToggleGroupItem value='center' aria-label='Align center' />}>
          <AlignCenter {...stylex.props(styles.icon)} />
        </ToolbarButton>
        <ToolbarButton render={<ToggleGroupItem value='right' aria-label='Align right' />}>
          <AlignRight {...stylex.props(styles.icon)} />
        </ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton render={<Button variant='ghost' size='sm' />}>Accio</ToolbarButton>
    </Toolbar>
  )
}
