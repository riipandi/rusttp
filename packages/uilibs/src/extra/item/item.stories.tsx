import { Home, Info } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { Avatar, AvatarFallback, AvatarImage } from '../../base/avatar'
import { Button } from '../../base/button'
import { Switch } from '../../base/switch'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from './item.component'

const meta = {
  title: 'Extra Components/Item',
  component: Item,
  argTypes: {
    variant: { control: 'radio', options: ['ghost', 'outline', 'faded'] },
    size: { control: 'radio', options: ['xs', 'sm', 'md'] }
  },
  tags: [] // ['autodocs']
} satisfies Meta<typeof Item>

type Story = StoryObj<typeof meta>

const activity = [
  { title: 'Patronus received', description: "Headmaster's office · 2 minutes ago" },
  { title: 'Howler received', description: 'On essay #482 · 1 hour ago' },
  { title: 'Polyjuice failed', description: "Moody's flask · yesterday" }
]

const styles = stylex.create({
  icon: { height: 16, width: 16 },
  group: {
    maxWidth: container.xlarge
  }
})

export default meta

export const Playground: Story = {
  args: { variant: 'outline' },
  render: () => (
    <ItemGroup style={styles.group}>
      <Item variant='outline'>
        <ItemContent>
          <ItemTitle>Protego Totalum</ItemTitle>
          <ItemDescription>Add an extra layer of protection to the Burrow.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch defaultChecked aria-label='Protego Totalum' />
        </ItemActions>
      </Item>
      <Item variant='faded'>
        <ItemMedia variant='icon'>
          <Info {...stylex.props(styles.icon)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Broom in stock</ItemTitle>
          <ItemDescription>Nimbus 2.4 is ready to order.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant='outline' size='sm'>
            Order
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvas }) => {
    // Embedded controls stay interactive inside items.
    const protection = canvas.getByRole('switch')
    await userEvent.click(protection)
    await expect(protection).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(canvas.getByRole('button', { name: 'Order' }))
  }
}

export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={['ghost', 'outline', 'faded'] as const}>
      {(variant) => (
        <Item variant={variant} style={styles.group}>
          <ItemContent>
            <ItemTitle>Madam Malkin&apos;s robes ({variant})</ItemTitle>
            <ItemDescription>Standard fit, no embellishments.</ItemDescription>
          </ItemContent>
        </Item>
      )}
    </Axis>
  ),
  // Each fill differs from the others in color or edge.
  play: async ({ canvasElement }) => {
    const looks = new Set(
      ['ghost', 'outline', 'faded'].map((variant) => {
        const style = getComputedStyle(
          cellOf(canvasElement, 'variant', variant).firstElementChild ?? canvasElement
        )
        return `${style.backgroundColor}|${style.borderTopWidth}|${style.borderTopColor}`
      })
    )
    await expect(looks.size).toBe(3)
  }
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={['xs', 'sm', 'md'] as const}>
      {(size) => (
        <Item variant='outline' size={size} style={styles.group}>
          <ItemContent>
            <ItemTitle>Robe fitting ({size})</ItemTitle>
            <ItemDescription>Padding follows the size.</ItemDescription>
          </ItemContent>
        </Item>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      (
        cellOf(canvasElement, 'size', size).firstElementChild ?? canvasElement
      ).getBoundingClientRect().height
    await expect(height('xs')).toBeLessThan(height('sm'))
    // audit-00002 F-15: `sm` and `md` share one padding and gap, so they are the same height.
    // Tighten this to `sm < md` when the sizes are told apart.
    await expect(height('sm')).toBeLessThanOrEqual(height('md'))
  }
}

export const WithAvatar: Story = {
  name: 'Avatar',
  render: () => (
    <ItemGroup style={styles.group}>
      <Item variant='outline'>
        <ItemMedia>
          <Avatar>
            <AvatarImage src='https://github.com/madeui.png' alt='Luna Lovegood' />
            <AvatarFallback>LL</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Luna Lovegood</ItemTitle>
          <ItemDescription>Left a note in your Advanced Potion-Making.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  )
}

export const Group: Story = {
  render: () => (
    <ItemGroup style={styles.group}>
      {activity.map((entry, index) => (
        <React.Fragment key={entry.title}>
          <Item>
            <ItemContent>
              <ItemTitle>{entry.title}</ItemTitle>
              <ItemDescription>{entry.description}</ItemDescription>
            </ItemContent>
          </Item>
          {index < activity.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  )
}

export const Link: Story = {
  render: () => (
    // The `render` prop swaps the underlying element — here an <a>, so hover and
    // focus states apply to the anchor.
    <Item variant='outline' render={<a href='#dashboard' />}>
      <ItemMedia variant='icon'>
        <Home {...stylex.props(styles.icon)} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Marauder's Map</ItemTitle>
        <ItemDescription>Every corridor of Hogwarts, live on parchment.</ItemDescription>
      </ItemContent>
    </Item>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /marauder's map/i })
    await expect(link).toHaveAttribute('href', '#dashboard')
  }
}
