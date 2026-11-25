import { FileText, Package, Search } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent } from 'storybook/test'
import { Avatar, AvatarFallback, AvatarImage } from '../../base/avatar'
import { Button } from '../../base/button'
import { Axis } from '../../contracts/story-axes'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../input-group'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from './empty.component'

const meta = {
  title: 'Extra Components/Empty',
  component: Empty,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Empty>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { height: 16, width: 16 },
  smallIcon: { height: 14, width: 14 },
  solidBorder: {
    // A solid outline instead of the default dashed border.
    borderStyle: 'solid'
  }
})

export default meta

// The title and media kind belong to `EmptyTitle` and `EmptyMedia`.
type PlaygroundArgs = Pick<ComponentProps<typeof EmptyMedia>, 'kind'> & { title: string }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['title', 'kind'] } },
  argTypes: {
    title: { control: 'text' },
    kind: { control: 'radio', options: ['default', 'icon'] }
  },
  args: { title: 'No potions brewed', kind: 'icon' },
  render: ({ title, kind }) => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia kind={kind}>
          <Package {...stylex.props(styles.icon)} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          You haven't brewed anything yet. Start with a simple Cure for Boils.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size='small'>Brew a potion</Button>
      </EmptyContent>
    </Empty>
  )
}

/** The media is a bare slot (`default`) or a tinted icon tile (`icon`). */
export const Kinds: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Empty>
  <EmptyHeader>
    <EmptyMedia kind='icon'>
      <Package />
    </EmptyMedia>
    <EmptyTitle>No potions brewed</EmptyTitle>
  </EmptyHeader>
</Empty>`
      }
    }
  },
  render: () => (
    <Axis axis='kind' rows={['default', 'icon'] as const}>
      {(kind) => (
        <Empty>
          <EmptyHeader>
            <EmptyMedia kind={kind} data-testid={`media-${kind}`}>
              <Package {...stylex.props(styles.icon)} />
            </EmptyMedia>
            <EmptyTitle>No potions brewed ({kind})</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const media = (kind: string) => getComputedStyle(canvas.getByTestId(`media-${kind}`))
    // Only the icon tile has a fill of its own.
    await expect(media('icon').backgroundColor).not.toBe(media('default').backgroundColor)
    await expect(media('icon').width).not.toBe(media('default').width)
  }
}

export const Outline: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Empty style={…}>
  <EmptyHeader>
    <EmptyMedia kind='icon'>
      <FileText />
    </EmptyMedia>
    <EmptyTitle>No owls today</EmptyTitle>
    <EmptyDescription>No letters from Hogwarts. New post will show up here.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button variant='outline' size='small'>Check the owlery</Button>
  </EmptyContent>
</Empty>`
      }
    }
  },
  render: () => (
    <Empty style={styles.solidBorder}>
      <EmptyHeader>
        <EmptyMedia kind='icon'>
          <FileText {...stylex.props(styles.icon)} />
        </EmptyMedia>
        <EmptyTitle>No owls today</EmptyTitle>
        <EmptyDescription>No letters from Hogwarts. New post will show up here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant='outline' size='small'>
          Check the owlery
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export const WithAvatar: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Empty>
  <EmptyHeader>
    <EmptyMedia>
      <Avatar size='large'>
        <AvatarImage src='…' alt='Luna Lovegood' />
        <AvatarFallback>LL</AvatarFallback>
      </Avatar>
    </EmptyMedia>
    <EmptyTitle>No aurors found</EmptyTitle>
    <EmptyDescription>Recruit members for the Order of the Phoenix.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button size='small'>Send an owl</Button>
  </EmptyContent>
</Empty>`
      }
    }
  },
  name: 'Avatar',
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Avatar size='large'>
            <AvatarImage src='https://github.com/madeui.png' alt='Luna Lovegood' />
            <AvatarFallback>LL</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>No aurors found</EmptyTitle>
        <EmptyDescription>Recruit members for the Order of the Phoenix.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size='small'>Send an owl</Button>
      </EmptyContent>
    </Empty>
  )
}

export const WithInputGroup: Story = {
  name: 'Input group',
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia kind='icon'>
          <Search {...stylex.props(styles.icon)} />
        </EmptyMedia>
        <EmptyTitle>No spells found</EmptyTitle>
        <EmptyDescription>Try a different incantation.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup>
          <InputGroupInput placeholder='Search spells…' />
          <InputGroupAddon>
            <Search {...stylex.props(styles.smallIcon)} />
          </InputGroupAddon>
        </InputGroup>
      </EmptyContent>
    </Empty>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText('Search spells…')
    await userEvent.type(input, 'riddikulus')
    await expect(input).toHaveValue('riddikulus')
  }
}

/** `render` swaps the `div` for a `section`, named by its title. */
export const AsElement: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Empty render={<section aria-labelledby='empty-title' />}>
  <EmptyHeader>
    <EmptyTitle id='empty-title'>No owls today</EmptyTitle>
    <EmptyDescription>The Owlery is quiet.</EmptyDescription>
  </EmptyHeader>
</Empty>`
      }
    }
  },
  name: 'As another element',
  render: () => (
    <Empty render={<section aria-labelledby='empty-title' />}>
      <EmptyHeader>
        <EmptyTitle id='empty-title'>No owls today</EmptyTitle>
        <EmptyDescription>The Owlery is quiet.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole('region', { name: 'No owls today' })
    await expect(region.tagName).toBe('SECTION')
    await expect(getComputedStyle(region).borderTopStyle).toBe('dashed')
  }
}
