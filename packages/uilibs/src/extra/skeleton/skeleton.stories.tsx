import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { container, radius } from '../../styles/tokens.stylex'
import { Skeleton } from './skeleton.component'
import { skeletonRadius } from './skeleton.stylex'

const meta = {
  title: 'Extra Components/Skeleton',
  component: Skeleton,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Skeleton>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    gap: 16
  },
  avatar: {
    borderRadius: radius.full,
    height: 48,
    width: 48
  },
  lines: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  line: {
    height: 16,
    width: 64
  },
  cardRoot: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: container.xsmall
  },
  image: {
    borderRadius: radius.large,
    height: container.xxsmall,
    width: '100%'
  },
  cardLineWide: {
    height: 16,
    width: '100%'
  },
  cardLine: {
    height: 16,
    width: '60%'
  },
  listRoot: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: container.small
  },
  listRow: {
    alignItems: 'center',
    display: 'flex',
    gap: 12
  },
  listAvatar: {
    borderRadius: radius.full,
    flexShrink: 0,
    height: 40,
    width: 40
  },
  listLines: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 8
  },
  listLineWide: {
    height: 16,
    width: '70%'
  },
  listLine: {
    height: 16,
    width: '40%'
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['width', 'height', 'borderRadius'] } },
  argTypes: {
    width: { control: 'text' },
    height: { control: 'number' },
    borderRadius: { control: 'select', options: Object.keys(skeletonRadius) }
  },
  args: { width: '10rem', height: 4, borderRadius: 'medium' },
  render: (args) => (
    <div data-testid='skeleton-scene' {...stylex.props(styles.root)}>
      <Skeleton style={styles.avatar} />
      <div {...stylex.props(styles.lines)}>
        <Skeleton {...args} />
        <Skeleton style={styles.line} />
      </div>
    </div>
  ),
  // Skeletons are empty presentational placeholders — four shapes for the
  // avatar and two text lines (plus their wrapper).
  play: async ({ canvas }) => {
    const scene = canvas.getByTestId('skeleton-scene')
    await expect(scene.querySelectorAll('div').length).toBe(4)
  }
}

export const Card: Story = {
  render: () => (
    <div {...stylex.props(styles.cardRoot)}>
      <Skeleton style={styles.image} />
      <Skeleton style={styles.cardLineWide} />
      <Skeleton style={styles.cardLine} />
    </div>
  )
}

export const List: Story = {
  render: () => (
    <div {...stylex.props(styles.listRoot)}>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} {...stylex.props(styles.listRow)}>
          <Skeleton style={styles.listAvatar} />
          <div {...stylex.props(styles.listLines)}>
            <Skeleton style={styles.listLineWide} />
            <Skeleton style={styles.listLine} />
          </div>
        </div>
      ))}
    </div>
  )
}

const shapes = {
  avatar: { width: 12, height: 12, borderRadius: 'full' },
  line: { width: '60%', height: 4, borderRadius: 'small' },
  block: { width: 20, height: 10, borderRadius: 'large' }
} as const

/** Size and corner by prop: a count of `unit` steps (`12` is 48px) or a CSS length, and a radius token. */
export const Shapes: Story = {
  render: () => (
    <Axis axis='shape' rows={['avatar', 'line', 'block'] as const}>
      {(shape) => <Skeleton {...shapes[shape]} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const skeleton = (shape: string) => {
      const el = canvasElement.querySelector(`[data-shape="${shape}"]`)?.firstElementChild
      if (!(el instanceof HTMLElement)) throw new Error(`No skeleton for ${shape}`)
      return el
    }
    const avatar = getComputedStyle(skeleton('avatar'))
    await expect([avatar.width, avatar.height, avatar.borderTopLeftRadius]).toEqual([
      '48px',
      '48px',
      '999px'
    ])
    const line = skeleton('line')
    // A CSS length is taken as written: 60% of the cell.
    await expect(line.getBoundingClientRect().width).toBeCloseTo(
      (line.parentElement?.getBoundingClientRect().width ?? 0) * 0.6,
      0
    )
    await expect(getComputedStyle(line).height).toBe('16px')
    const block = getComputedStyle(skeleton('block'))
    await expect([block.width, block.height, block.borderTopLeftRadius]).toEqual([
      '80px',
      '40px',
      '10px'
    ])
  }
}
