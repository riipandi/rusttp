import { Home, Info } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
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
import { itemSizes, itemVariants } from './item.stylex'

const meta = {
  title: 'Extra Components/Item',
  component: Item,
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
  parameters: { controls: { disable: false, include: ['variant', 'size'] } },
  argTypes: {
    variant: { control: 'radio', options: Object.keys(itemVariants) },
    size: { control: 'radio', options: Object.keys(itemSizes) }
  },
  args: { variant: 'outline', size: 'medium' },
  render: (args) => (
    <ItemGroup style={styles.group}>
      <Item {...args}>
        <ItemContent>
          <ItemTitle>Protego Totalum</ItemTitle>
          <ItemDescription>Add an extra layer of protection to the Burrow.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch defaultChecked aria-label='Protego Totalum' />
        </ItemActions>
      </Item>
      <Item {...args}>
        <ItemMedia kind='icon'>
          <Info {...stylex.props(styles.icon)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Broom in stock</ItemTitle>
          <ItemDescription>Nimbus 2.4 is ready to order.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant='outline' size='small'>
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
  parameters: {
    docs: {
      source: {
        code: `<Item variant='faded'>
  <ItemContent>
    <ItemTitle>Madam Malkin's robes (faded)</ItemTitle>
    <ItemDescription>Standard fit, no embellishments.</ItemDescription>
  </ItemContent>
</Item>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Item variant='outline' size='xsmall'>
  <ItemContent>
    <ItemTitle>Robe fitting (xsmall)</ItemTitle>
    <ItemDescription>Padding follows the size.</ItemDescription>
  </ItemContent>
</Item>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={['xsmall', 'small', 'medium'] as const}>
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
    await expect(height('xsmall')).toBeLessThan(height('small'))
    await expect(height('small')).toBeLessThan(height('medium'))
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
  parameters: {
    docs: {
      source: {
        code: `<ItemGroup>
  <Item>
    <ItemContent>
      <ItemTitle>Patronus received</ItemTitle>
      <ItemDescription>Headmaster's office · 2 minutes ago</ItemDescription>
    </ItemContent>
  </Item>
  <ItemSeparator />
  <Item>
    <ItemContent>
      <ItemTitle>Howler received</ItemTitle>
      <ItemDescription>On essay #482 · 1 hour ago</ItemDescription>
    </ItemContent>
  </Item>
</ItemGroup>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Item variant='outline' render={<a href='#dashboard' />}>
  <ItemMedia kind='icon'>
    <Home />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Marauder's Map</ItemTitle>
    <ItemDescription>Every corridor of Hogwarts, live on parchment.</ItemDescription>
  </ItemContent>
</Item>`
      }
    }
  },
  render: () => (
    // The `render` prop swaps the underlying element — here an <a>, so hover and
    // focus states apply to the anchor.
    <Item variant='outline' render={<a href='#dashboard' />}>
      <ItemMedia kind='icon'>
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

const destinations = [
  { name: "Marauder's Map", href: '#map' },
  { name: 'Room of Requirement', href: '#room' },
  { name: 'Pensieve', href: '#pensieve' }
]

/** In a group, `listitem` sits on a wrapper, so each rendered link keeps its `link` role. */
export const LinkGroup: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ItemGroup>
  <Item variant='outline' render={<a href='#map' />}>
    <ItemContent>
      <ItemTitle>Marauder's Map</ItemTitle>
    </ItemContent>
  </Item>
  <Item variant='outline' render={<a href='#room' />}>
    <ItemContent>
      <ItemTitle>Room of Requirement</ItemTitle>
    </ItemContent>
  </Item>
</ItemGroup>`
      }
    }
  },
  name: 'Link group',
  render: () => (
    <ItemGroup style={styles.group}>
      {destinations.map((destination) => (
        <Item key={destination.href} variant='outline' render={<a href={destination.href} />}>
          <ItemContent>
            <ItemTitle>{destination.name}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('listitem')
    await expect(rows.length).toBe(destinations.length)
    for (const [index, row] of rows.entries()) {
      const link = within(row).getByRole('link', { name: destinations[index]?.name })
      await expect(link).toHaveAttribute('href', destinations[index]?.href)
      await expect(link).not.toHaveAttribute('role')
    }
  }
}

const onOpen = fn()

/** An item rendered as a link is one Tab stop; Enter follows it. */
export const Keyboard: Story = {
  render: () => (
    <ItemGroup style={styles.group}>
      {destinations.map((destination) => (
        <Item
          key={destination.href}
          variant='outline'
          render={
            <a
              href={destination.href}
              onClick={(event) => {
                event.preventDefault()
                onOpen(destination.name)
              }}
            />
          }
        >
          <ItemContent>
            <ItemTitle>{destination.name}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
  play: async ({ canvas }) => {
    onOpen.mockClear()
    const links = canvas.getAllByRole('link')
    await expect(links).toHaveLength(destinations.length)
    links[0]?.focus()
    for (const link of links.slice(1)) {
      await userEvent.tab()
      await waitFor(() => expect(link).toHaveFocus())
    }
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(links[1]).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(onOpen).toHaveBeenLastCalledWith('Room of Requirement')
  }
}
