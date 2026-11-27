import { Check } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, waitFor } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from './avatar.component'
import { avatarFills, avatarSizes } from './avatar.stylex'

const meta = {
  title: 'Base Components/Avatar',
  component: Avatar
} satisfies Meta<typeof Avatar>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  badgeIcon: { height: 12, width: 12 }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'variant', 'color', 'squared'] } },
  argTypes: {
    size: { control: 'radio', options: Object.keys(avatarSizes) },
    variant: { control: 'radio', options: Object.keys(avatarFills) },
    color: { control: 'select', options: Object.keys(avatarFills.faded) },
    squared: { control: 'boolean' }
  },
  args: { size: 'medium', variant: 'faded', color: 'neutral', squared: false },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src='https://github.com/madeui.png' alt='@harry.potter' />
      <AvatarFallback>HP</AvatarFallback>
    </Avatar>
  )
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar size='small'>
  <AvatarFallback>HP</AvatarFallback>
</Avatar>
<Avatar size='large'>
  <AvatarFallback>HP</AvatarFallback>
</Avatar>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={['small', 'medium', 'large'] as const}>
      {(size) => (
        <Avatar size={size}>
          <AvatarFallback>HP</AvatarFallback>
        </Avatar>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const side = (size: string) => {
      const { width, height } = (
        cellOf(canvasElement, 'size', size).firstElementChild ?? canvasElement
      ).getBoundingClientRect()
      return width === height ? width : -1
    }
    // Square, and 32, 40, and 48 px.
    await expect(['small', 'medium', 'large'].map(side)).toEqual([32, 40, 48])
  }
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src='https://example.com/broken.png' alt='Vanished portrait' />
      <AvatarFallback>GH</AvatarFallback>
    </Avatar>
  ),
  // A broken image swaps in the fallback initials.
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText('GH')).toBeInTheDocument())
    await expect(canvas.queryByText('HP')).toBeNull()
  }
}

export const Badge: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar>
  <AvatarImage src='https://github.com/madeui.png' alt='@luna.lovegood' />
  <AvatarFallback>LL</AvatarFallback>
  <AvatarBadge />
</Avatar>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(atoms.display.flex, atoms.gap['24px'])}>
      <Avatar>
        <AvatarImage src='https://github.com/madeui.png' alt='@luna.lovegood' />
        <AvatarFallback>LL</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar>
        <AvatarImage src='https://github.com/github.png' alt='@hermione.granger' />
        <AvatarFallback>HG</AvatarFallback>
        <AvatarBadge>
          <Check {...stylex.props(styles.badgeIcon)} />
        </AvatarBadge>
      </Avatar>
    </div>
  )
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src='https://github.com/madeui.png' alt='@harry.potter' />
        <AvatarFallback>HP</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src='https://github.com/github.png' alt='@ron.weasley' />
        <AvatarFallback>RW</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src='https://github.com/vercel.png' alt='@hermione.granger' />
        <AvatarFallback>HG</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  )
}

export const GroupCount: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AvatarGroup>
  <Avatar>
    <AvatarImage src='https://github.com/madeui.png' alt='@harry.potter' />
    <AvatarFallback>HP</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarImage src='https://github.com/github.png' alt='@ron.weasley' />
    <AvatarFallback>RW</AvatarFallback>
  </Avatar>
  <AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>`
      }
    }
  },
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src='https://github.com/madeui.png' alt='@harry.potter' />
        <AvatarFallback>HP</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src='https://github.com/github.png' alt='@ron.weasley' />
        <AvatarFallback>RW</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    // The trailing count and each avatar render in the stack.
    await expect(canvas.getByText('+3')).toBeInTheDocument()
  }
}

const variantNames = ['faded', 'solid'] as const
const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

/** The fallback in every fill and role; the a11y gate checks the contrast of each pair. */
export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Avatar variant='faded' color='primary'>
  <AvatarFallback>HP</AvatarFallback>
</Avatar>
<Avatar variant='solid' color='critical'>
  <AvatarFallback>HP</AvatarFallback>
</Avatar>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={variantNames} columnAxis='color' columns={colorNames}>
      {(variant, color) => (
        <Avatar variant={variant} color={color}>
          <AvatarFallback>HP</AvatarFallback>
        </Avatar>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const fill = (variant: string, color: string) => {
      const avatar = canvasElement.querySelector(
        `[data-variant="${variant}"][data-color="${color}"]`
      )?.firstElementChild
      if (!avatar) throw new Error(`No avatar for ${variant} ${color}`)
      return getComputedStyle(avatar).backgroundColor
    }
    for (const variant of variantNames) {
      await expect(new Set(colorNames.map((color) => fill(variant, color))).size).toBe(5)
    }
  }
}

export const Squared: Story = {
  render: () => (
    <Avatar squared data-testid='squared'>
      <AvatarFallback>HG</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    const root = canvas.getByTestId('squared')
    await expect(getComputedStyle(root).borderTopLeftRadius).toBe('8px')
    // The fallback follows the root's corners.
    await expect(getComputedStyle(canvas.getByText('HG')).borderTopLeftRadius).toBe('8px')
  }
}

// A 1 x 1 GIF: it decodes at once, so the image loads on every engine without the network.
const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/** `alt` names the picture, and once it loads the fallback text steps aside. */
export const Named: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src={pixel} alt='Hermione Granger' />
      <AvatarFallback>HG</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole('img', { name: 'Hermione Granger' })).toBeInTheDocument()
    )
    await expect(canvas.queryByText('HG')).toBeNull()
  }
}
