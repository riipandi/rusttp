import { AlignCenter, AlignLeft, AlignRight } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import { pressUntil } from '../../contracts/keyboard'
import { Button } from '../button'
import { Toggle } from '../toggle'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './toolbar.component'

const meta = {
  title: 'Base Components/Toolbar',
  component: Toolbar
} satisfies Meta<typeof Toolbar>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['disabled', 'loopFocus'] },
    docs: {
      source: {
        code: `<Toolbar>
  <ToolbarGroup>
    <ToolbarButton render={<Toggle aria-label='Toggle charm' />}>Charm</ToolbarButton>
    <ToolbarButton render={<Toggle aria-label='Toggle hex' />}>Hex</ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarButton render={<Button variant='ghost' size='small' />}>Send by Owl</ToolbarButton>
</Toolbar>`
      }
    }
  },
  argTypes: {
    disabled: { control: 'boolean' },
    loopFocus: { control: 'boolean' }
  },
  args: { disabled: false, loopFocus: true },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <ToolbarButton render={<Toggle aria-label='Toggle charm' />}>Charm</ToolbarButton>
        <ToolbarButton render={<Toggle aria-label='Toggle hex' />}>Hex</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton render={<Button variant='ghost' size='small' />}>Send by Owl</ToolbarButton>
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
  parameters: {
    docs: {
      source: {
        code: `<Toolbar>
  <ToggleGroup variant='outline' size='small' spacing='joined' defaultValue={['left']}>
    <ToolbarButton render={<ToggleGroupItem value='left' aria-label='Align left' />}>
      <AlignLeft />
    </ToolbarButton>
    <ToolbarButton render={<ToggleGroupItem value='center' aria-label='Align center' />}>
      <AlignCenter />
    </ToolbarButton>
  </ToggleGroup>
  <ToolbarSeparator />
  <ToolbarButton render={<Button variant='ghost' size='small' />}>Accio</ToolbarButton>
</Toolbar>`
      }
    }
  },
  name: 'With a toggle group',
  render: () => (
    <Toolbar>
      <ToggleGroup variant='outline' size='small' spacing='joined' defaultValue={['left']}>
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
      <ToolbarButton render={<Button variant='ghost' size='small' />}>Accio</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvas }) => {
    const toolbar = canvas.getByRole('toolbar')
    const first = canvas.getByRole('button', { name: 'Align left' })
    const last = canvas.getByRole('button', { name: 'Align right' })
    const accio = canvas.getByRole('button', { name: 'Accio' })
    const px = (value: string) => Number.parseFloat(value)
    const outer = getComputedStyle(toolbar)
    const inner = getComputedStyle(first)
    // Concentric corners: a nested corner is the outer radius less the padding between them.
    await expect(px(outer.borderTopLeftRadius)).toBe(
      px(inner.borderTopLeftRadius) + px(outer.paddingLeft)
    )
    await expect(px(outer.borderTopRightRadius)).toBe(
      px(getComputedStyle(last).borderTopRightRadius) + px(outer.paddingRight)
    )
    // The group's items and the button beside it are one control height.
    await expect(first.getBoundingClientRect().height).toBe(accio.getBoundingClientRect().height)
  }
}

/** Tab enters the toolbar in one stop, the arrows move focus along its items and loop, Home and End do nothing, and Space presses the focused toggle. */
export const Keyboard: Story = {
  render: () => (
    <>
      <Toolbar aria-label='Spell formatting'>
        <ToolbarButton render={<Toggle aria-label='Toggle charm' />}>Charm</ToolbarButton>
        <ToolbarButton render={<Toggle aria-label='Toggle hex' />}>Hex</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton render={<Button variant='ghost' size='small' />}>Send by Owl</ToolbarButton>
      </Toolbar>
      <Button size='small'>Outside</Button>
    </>
  ),
  play: async ({ canvas }) => {
    const charm = canvas.getByRole('button', { name: 'Toggle charm' })
    const hex = canvas.getByRole('button', { name: 'Toggle hex' })
    const owl = canvas.getByRole('button', { name: 'Send by Owl' })
    const outside = canvas.getByRole('button', { name: 'Outside' })

    // The toolbar is one tab stop, on its first item.
    await expect(canvas.getByRole('toolbar', { name: 'Spell formatting' })).toBeInTheDocument()
    await userEvent.tab()
    await expect(charm).toHaveFocus()
    await pressUntil('{ArrowRight}', () => expect(hex).toHaveFocus(), {
      when: () => document.activeElement === charm
    })
    await userEvent.keyboard(' ')
    await expect(hex).toHaveAttribute('aria-pressed', 'true')
    await pressUntil('{ArrowRight}', () => expect(owl).toHaveFocus(), {
      when: () => document.activeElement === hex
    })

    // The row loops at both ends.
    await pressUntil('{ArrowRight}', () => expect(charm).toHaveFocus(), {
      when: () => document.activeElement === owl
    })
    await pressUntil('{ArrowLeft}', () => expect(owl).toHaveFocus(), {
      when: () => document.activeElement === charm
    })
    // Base UI's toolbar does not handle Home and End: focus stays where it is.
    await userEvent.keyboard('{End}')
    await expect(owl).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(owl).toHaveFocus()

    // Tab leaves the toolbar in one press.
    await userEvent.tab()
    await expect(outside).toHaveFocus()
  }
}
