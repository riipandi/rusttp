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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../base/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../base/tooltip'
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
  icon: { width: 16, height: 16 }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['orientation', 'size', 'variant'] } },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'radio', options: ['solid', 'faded', 'outline', 'ghost'] }
  },
  args: { orientation: 'horizontal', size: 'md', variant: 'outline' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Expelliarmus</Button>
      <Button>Petrificus Totalus</Button>
      <Button>Stupefy</Button>
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
    // The trigger's `render` swaps it for a Button; the Button reads the group's context through
    // the menu root, so it is fused to the primary action with no styling of its own.
    <ButtonGroup>
      <Button>Apparate</Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size='icon-md' aria-label='More apparition options' />}
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

    const trigger = canvas.getByRole('button', { name: 'More apparition options' })
    const style = getComputedStyle(trigger)
    await expect(style.borderTopLeftRadius).toBe('0px')
    await expect(style.borderLeftWidth).toBe('1px')
    await expect(style.borderTopRightRadius).not.toBe('0px')

    await userEvent.click(trigger)
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
  // A Fragment and a Tooltip-wrapped Button are members like the rest: no duplicate keys, and the
  // console gate stays on.
  render: () => (
    <ButtonGroup aria-label='Wand woods'>
      <Button>Holly</Button>
      <Button>Elder</Button>
      <>
        <Button variant='faded'>Yew</Button>
        <Button color='critical'>Vine</Button>
      </>
      <Tooltip>
        <TooltipTrigger render={<Button color='positive' />}>Ash</TooltipTrigger>
        <TooltipContent>Ash, the wand that favors its own master</TooltipContent>
      </Tooltip>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const [first, ...rest] = within(canvas.getByRole('group', { name: 'Wand woods' })).getAllByRole(
      'button'
    )
    await expect(first && getComputedStyle(first).borderLeftWidth).toBe('0px')
    // A Fragment's children and a Tooltip's trigger are joined like the others: four dividers for
    // five buttons.
    await expect(rest).toHaveLength(4)
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

const height = (el: HTMLElement) => el.getBoundingClientRect().height

/** A size or a variant on the group is the default of every member; a member can still set its own. */
export const Defaults: Story = {
  name: 'Group sets size and variant',
  render: () => (
    <ButtonGroup aria-label='Defaults' size='sm' variant='outline'>
      <Button>Reparo</Button>
      <Button size='lg'>Reducto</Button>
      <Button variant='ghost'>Riddikulus</Button>
      <Input aria-label='Counter-curse' placeholder='Counter-curse' />
      <Select defaultValue='Nox'>
        <SelectTrigger aria-label='Spell'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='Nox'>Nox</SelectItem>
          <SelectItem value='Lumos'>Lumos</SelectItem>
        </SelectContent>
      </Select>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Defaults' })
    await expect(height(within(group).getByRole('button', { name: 'Reparo' }))).toBe(32)
    await expect(height(within(group).getByRole('button', { name: 'Reducto' }))).toBe(40)
    await expect(height(within(group).getByRole('textbox'))).toBe(32)
    await expect(height(within(group).getByRole('combobox', { name: 'Spell' }))).toBe(32)
    // The ghost button took its own variant, not the group's outline: no tint, no border of its own.
    const ghost = getComputedStyle(within(group).getByRole('button', { name: 'Riddikulus' }))
    await expect(ghost.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  }
}
