import { ChevronDown } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../base/dropdown-menu'
import { Input } from '../../base/input'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group.component'

const meta = {
  title: 'Extra Components/ButtonGroup',
  component: ButtonGroup,
  tags: [] // ['autodocs']
} satisfies Meta<typeof ButtonGroup>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 },
  fusedTrigger: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['orientation'] } },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] }
  },
  args: { orientation: 'horizontal' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant='outline'>Expelliarmus</Button>
      <Button variant='outline'>Petrificus Totalus</Button>
      <Button variant='outline'>Stupefy</Button>
    </ButtonGroup>
  )
}

export const Orientations: Story = {
  render: () => (
    <Axis axis='orientation' rows={['horizontal', 'vertical'] as const}>
      {(orientation) => (
        <ButtonGroup orientation={orientation} aria-label={`Charms ${orientation}`}>
          <Button variant='outline'>Accio</Button>
          <Button variant='outline'>Alohomora</Button>
          <Button variant='outline'>Lumos</Button>
        </ButtonGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const [h1, h2] = Array.from(
      cellOf(canvasElement, 'orientation', 'horizontal').querySelectorAll('button')
    ).map((el) => el.getBoundingClientRect())
    const [v1, v2] = Array.from(
      cellOf(canvasElement, 'orientation', 'vertical').querySelectorAll('button')
    ).map((el) => el.getBoundingClientRect())
    if (!h1 || !h2 || !v1 || !v2) throw new Error('Group buttons not found')
    await expect(h2.left).toBeGreaterThan(h1.left)
    await expect(h2.top).toBe(h1.top)
    await expect(v2.top).toBeGreaterThan(v1.top)
    await expect(v2.left).toBe(v1.left)
  }
}

export const Split: Story = {
  name: 'Split button',
  render: () => (
    // The trigger's `render` swaps it for a Button — ButtonGroup then fuses both
    // the primary action and the trigger into one segmented control.
    <ButtonGroup>
      <Button>Apparate</Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size='icon-md'
              aria-label='More apparition options'
              style={styles.fusedTrigger}
            />
          }
        >
          <ChevronDown {...stylex.props(styles.icon)} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>Apparate to Hogsmeade</DropdownMenuItem>
          <DropdownMenuItem>Return to Hogwarts</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'More apparition options' }))
    await body.findByRole('menu')
    await userEvent.click(body.getByRole('menuitem', { name: 'Apparate to Hogsmeade' }))
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())
  }
}

export const Text: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>House</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant='outline'>Gryffindor</Button>
      <Button variant='outline'>Slytherin</Button>
      <Button variant='outline'>All</Button>
    </ButtonGroup>
  )
}

export const WithInput: Story = {
  name: 'Input',
  render: () => (
    <ButtonGroup>
      <Input type='email' placeholder='Owl address' />
      <Button variant='outline'>Join the Order</Button>
    </ButtonGroup>
  )
}

/** Filled buttons have no border to share, so the group draws a divider between them. */
export const FilledDividers: Story = {
  name: 'Filled buttons get dividers',
  // audit-00002 F-01: `ButtonGroup` re-keys a Fragment's children with the same `.0`, `.1` keys
  // `toArray` gave the outer ones, so React logs a duplicate-key error. The console gate stays off
  // for this story until the fix; delete the line to reproduce.
  parameters: { consoleErrors: 'off' },
  render: () => (
    <ButtonGroup aria-label='Wand woods'>
      <Button>Holly</Button>
      <Button>Elder</Button>
      <>
        <Button variant='faded'>Yew</Button>
        <Button color='critical'>Vine</Button>
      </>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const [first, ...rest] = within(canvas.getByRole('group', { name: 'Wand woods' })).getAllByRole(
      'button'
    )
    await expect(first && getComputedStyle(first).borderLeftWidth).toBe('0px')
    // A Fragment's children are joined like the others: three dividers for four buttons.
    await expect(rest).toHaveLength(3)
    for (const button of rest) {
      const style = getComputedStyle(button)
      await expect(style.borderLeftWidth).toBe('1px')
      await expect(style.borderLeftStyle).toBe('solid')
    }
  }
}

/** Text between children is kept, not dropped. */
export const KeepsText: Story = {
  name: 'Keeps text children',
  render: () => (
    <ButtonGroup aria-label='Choices'>
      <Button variant='outline'>Accept</Button>
      or
      <Button variant='outline'>Decline</Button>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Choices' })).toHaveTextContent('Accept')
    await expect(canvas.getByRole('group', { name: 'Choices' })).toHaveTextContent('or')
  }
}
