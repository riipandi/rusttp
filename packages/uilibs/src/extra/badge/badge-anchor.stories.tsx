import { Bell } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, waitFor } from 'storybook/test'
import { Avatar, AvatarFallback } from '../../base/avatar'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { unit } from '../../styles/tokens.stylex'
import { visuallyHidden } from '../../styles/utils.stylex'
import {
  BadgeAnchor,
  type BadgeAnchorCorner,
  type BadgeAnchorOverlap
} from './badge-anchor.component'
import { Badge } from './badge.component'

const meta = {
  title: 'Extra Components/BadgeAnchor',
  component: BadgeAnchor,
  tags: [] // ['autodocs']
} satisfies Meta<typeof BadgeAnchor>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  // Longhands: a `padding` shorthand loses to the Badge's own `paddingInline`.
  dot: { height: unit.x2, paddingBlock: 0, paddingInline: 0, width: unit.x2 },
  row: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: unit.x6 }
})

export default meta

const corners = [
  'top-end',
  'top-start',
  'bottom-end',
  'bottom-start'
] as const satisfies ReadonlyArray<BadgeAnchorCorner>
const overlaps = ['rectangular', 'circular'] as const satisfies ReadonlyArray<BadgeAnchorOverlap>

/** The anchored element, and the box the badge is placed against. */
function parts(anchor: HTMLElement) {
  const badge = anchor.querySelector('[data-slot="badge-anchor-badge"]')
  const target = anchor.firstElementChild
  if (!(badge instanceof HTMLElement) || !target) throw new Error('No badge anchor rendered')
  return { badge: badge.getBoundingClientRect(), target: target.getBoundingClientRect() }
}

/** The centre of the badge, measured from the top-left of the element it is pinned to. */
function centre(anchor: HTMLElement) {
  const { badge, target } = parts(anchor)
  return {
    x: badge.left + badge.width / 2 - target.left,
    y: badge.top + badge.height / 2 - target.top,
    width: target.width,
    height: target.height
  }
}

const near = (actual: number, expected: number) => Math.abs(actual - expected) <= 1

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['corner', 'overlap'] } },
  argTypes: {
    corner: { control: 'radio', options: corners },
    overlap: { control: 'radio', options: overlaps }
  },
  args: { badge: <Badge size='small'>3</Badge>, corner: 'top-end', overlap: 'circular' },
  render: (args) => (
    <BadgeAnchor {...args}>
      <Avatar size='large'>
        <AvatarFallback>HP</AvatarFallback>
      </Avatar>
    </BadgeAnchor>
  ),
  play: async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector('[data-slot="badge-anchor-badge"]')?.parentElement
    if (!anchor) throw new Error('No badge anchor rendered')
    // Default args: circular, top end. The badge is on the rim of the circle, so it is inside the
    // avatar's box, nearer the corner than the middle.
    await waitFor(() => expect(centre(anchor).x).toBeGreaterThan(centre(anchor).width / 2))
    await expect(centre(anchor).y).toBeLessThan(centre(anchor).height / 2)
  }
}

/** The badge is centred on each corner of the element's box, and the box does not change size. */
export const Corners: Story = {
  args: { badge: null },
  render: () => (
    <Axis axis='corner' rows={corners}>
      {(corner) => (
        <BadgeAnchor corner={corner} badge={<Badge size='small'>3</Badge>}>
          <Avatar squared size='large'>
            <AvatarFallback>HG</AvatarFallback>
          </Avatar>
        </BadgeAnchor>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const expected = {
      'top-end': [1, 0],
      'top-start': [0, 0],
      'bottom-end': [1, 1],
      'bottom-start': [0, 1]
    } as const
    for (const corner of corners) {
      const anchor = cellOf(canvasElement, 'corner', corner).firstElementChild
      if (!(anchor instanceof HTMLElement)) throw new Error(`No anchor for ${corner}`)
      const [fx, fy] = expected[corner]
      await waitFor(() => {
        const c = centre(anchor)
        if (!(near(c.x, fx * c.width) && near(c.y, fy * c.height)))
          throw new Error(`${corner}: badge centre at ${c.x}, ${c.y} of ${c.width} by ${c.height}`)
      })
    }
  }
}

/** On a round element the badge sits on its rim, 14.6% in from the corner of the box. */
export const Overlaps: Story = {
  args: { badge: null },
  render: () => (
    <Axis axis='overlap' rows={overlaps}>
      {(overlap) => (
        <BadgeAnchor overlap={overlap} badge={<Badge size='small'>9</Badge>}>
          <Avatar size='large'>
            <AvatarFallback>RW</AvatarFallback>
          </Avatar>
        </BadgeAnchor>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const anchorOf = (overlap: string) => {
      const found = cellOf(canvasElement, 'overlap', overlap).firstElementChild
      if (!(found instanceof HTMLElement)) throw new Error(`No anchor for ${overlap}`)
      return found
    }
    await waitFor(() => {
      const box = centre(anchorOf('rectangular'))
      if (!(near(box.x, box.width) && near(box.y, 0))) throw new Error('Not on the corner')
    })
    const round = centre(anchorOf('circular'))
    // The centre of the badge is one radius from the centre of the circle.
    const radius = round.width / 2
    const dx = round.x - radius
    const dy = round.y - radius
    await expect(Math.abs(Math.hypot(dx, dy) - radius)).toBeLessThan(1.5)
    await expect(dx).toBeGreaterThan(0)
    await expect(dy).toBeLessThan(0)
  }
}

/** Start and end follow the writing direction: in a right-to-left box, the end is on the left. */
export const Rtl: Story = {
  name: 'Right to left',
  args: { badge: null },
  render: () => (
    <div dir='rtl' {...stylex.props(styles.row)}>
      <BadgeAnchor corner='top-end' badge={<Badge size='small'>3</Badge>}>
        <Avatar squared size='large'>
          <AvatarFallback>LL</AvatarFallback>
        </Avatar>
      </BadgeAnchor>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector('[data-slot="badge-anchor-badge"]')?.parentElement
    if (!anchor) throw new Error('No badge anchor rendered')
    await waitFor(() => {
      const c = centre(anchor)
      if (!(near(c.x, 0) && near(c.y, 0))) throw new Error(`Badge centre at ${c.x}, ${c.y}`)
    })
  }
}

/** A count on an icon button, and a dot on an avatar. */
export const Anchors: Story = {
  args: { badge: null },
  render: () => (
    <div {...stylex.props(styles.row)}>
      {/* The button's name carries the count, so the badge is hidden from assistive technology. */}
      <BadgeAnchor
        overlap='circular'
        badge={
          <Badge size='small' aria-hidden>
            3
          </Badge>
        }
      >
        <Button variant='outline' rounded icon={Bell} aria-label='Owl post, 3 unread' />
      </BadgeAnchor>
      <BadgeAnchor
        overlap='circular'
        corner='bottom-end'
        badge={<Badge size='small' color='positive' aria-hidden style={styles.dot} />}
      >
        <Avatar>
          <AvatarFallback>DM</AvatarFallback>
        </Avatar>
      </BadgeAnchor>
      {/* Without a named control, the badge says what it counts in text only a screen reader sees. */}
      <BadgeAnchor
        overlap='circular'
        badge={
          <Badge size='small' color='critical'>
            12<span {...stylex.props(visuallyHidden.root)}> new howlers</span>
          </Badge>
        }
      >
        <Avatar>
          <AvatarFallback>MW</AvatarFallback>
        </Avatar>
      </BadgeAnchor>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Owl post, 3 unread' })).toBeVisible()
    // Pinning the badge adds nothing to the control's own box.
    const button = canvas.getByRole('button', { name: 'Owl post, 3 unread' })
    await expect(button.parentElement?.getBoundingClientRect().width).toBe(
      button.getBoundingClientRect().width
    )
    // The status dot is a circle: a badge with no content, as wide as it is tall.
    const dot = canvasElement.querySelector('[aria-hidden="true"]:empty')
    if (!(dot instanceof HTMLElement)) throw new Error('No status dot')
    const { width, height } = dot.getBoundingClientRect()
    await expect(width).toBe(height)
  }
}
