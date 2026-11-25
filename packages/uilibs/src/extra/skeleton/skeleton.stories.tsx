import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { Button } from '../../base/button'
import { Axis } from '../../contracts/story-axes'
import { container, radius } from '../../styles/tokens.stylex'
import { visuallyHidden } from '../../styles/utils.stylex'
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
  parameters: {
    docs: {
      source: {
        code: `<div>
  <Skeleton style={…} />
  <Skeleton style={…} />
  <Skeleton style={…} />
</div>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.cardRoot)}>
      <Skeleton style={styles.image} />
      <Skeleton style={styles.cardLineWide} />
      <Skeleton style={styles.cardLine} />
    </div>
  )
}

export const List: Story = {
  parameters: {
    docs: {
      source: {
        code: `{rows.map((row) => (
  <div key={row.id}>
    <Skeleton style={…} />
    <div>
      <Skeleton style={…} />
      <Skeleton style={…} />
    </div>
  </div>
))}`
      }
    }
  },
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

/**
 * A skeleton is a silent placeholder, so the container around it carries the loading state:
 * `aria-busy` on a `status` region, and a visually hidden word for what is loading.
 */
export const Busy: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div role='status' aria-busy={loading}>
  {loading ? (
    <>
      <span style={visuallyHidden}>Loading the owl post</span>
      <Skeleton style={…} />
      <Skeleton style={…} />
    </>
  ) : (
    <span>Hedwig has delivered 3 letters.</span>
  )}
</div>`
      }
    }
  },
  render: () => {
    const [loading, setLoading] = React.useState(true)
    return (
      <div {...stylex.props(styles.listRoot)}>
        <div role='status' aria-busy={loading} {...stylex.props(styles.listLines)}>
          {loading ? (
            <>
              <span {...stylex.props(visuallyHidden.root)}>Loading the owl post</span>
              <Skeleton style={styles.listLineWide} />
              <Skeleton style={styles.listLine} />
            </>
          ) : (
            <span>Hedwig has delivered 3 letters.</span>
          )}
        </div>
        <div>
          <Button variant='outline' size='small' onClick={() => setLoading((value) => !value)}>
            {loading ? 'Deliver' : 'Reload'}
          </Button>
        </div>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const status = canvas.getByRole('status')
    await expect(status).toHaveAttribute('aria-busy', 'true')
    await expect(status).toHaveTextContent('Loading the owl post')

    await userEvent.click(canvas.getByRole('button', { name: 'Deliver' }))
    await expect(status).toHaveAttribute('aria-busy', 'false')
    await expect(status).toHaveTextContent('Hedwig has delivered 3 letters.')
    await expect(status).not.toHaveTextContent('Loading')
  }
}

const shapes = {
  avatar: { width: 12, height: 12, borderRadius: 'full' },
  line: { width: '60%', height: 4, borderRadius: 'small' },
  block: { width: 20, height: 10, borderRadius: 'large' }
} as const

/** Size and corner by prop: a count of `unit` steps (`12` is 48px) or a CSS length, and a radius token. */
export const Shapes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Skeleton width={12} height={12} borderRadius='full' />

<Skeleton width='60%' height={4} borderRadius='small' />

<Skeleton width={20} height={10} borderRadius='large' />`
      }
    }
  },
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

/** `render` swaps the `div` for another element, such as a `span` inside running text. */
export const AsElement: Story = {
  parameters: {
    docs: { source: { code: `<Skeleton render={<span />} width={20} height={4} />` } }
  },
  name: 'As another element',
  render: () => <Skeleton render={<span data-testid='ghost' />} width={20} height={4} />,
  play: async ({ canvas }) => {
    const ghost = canvas.getByTestId('ghost')
    await expect(ghost.tagName).toBe('SPAN')
    await expect(getComputedStyle(ghost).width).toBe('80px')
  }
}
