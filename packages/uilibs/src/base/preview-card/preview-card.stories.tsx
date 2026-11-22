import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { fontSize, fontWeight } from '../../styles/tokens.stylex'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'
import { Button } from '../button'
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from './preview-card.component'

const meta = {
  title: 'Base Components/PreviewCard',
  component: PreviewCard,
  tags: [] // ['autodocs']
} satisfies Meta<typeof PreviewCard>

type Story = StoryObj<typeof meta>

const sides = ['top', 'right', 'bottom', 'left'] as const

const styles = stylex.create({
  row: {
    display: 'flex',
    gap: 12
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  name: {
    fontWeight: fontWeight.semibold
  },
  muted: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  }
})

export default meta

export const Playground: Story = {
  render: () => (
    <PreviewCard>
      <PreviewCardTrigger render={<Button variant='ghost' />}>@dumbledore</PreviewCardTrigger>
      <PreviewCardContent>
        <div {...stylex.props(styles.row)}>
          <Avatar>
            <AvatarImage src='https://github.com/vercel.png' alt='@dumbledore' />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div {...stylex.props(styles.info)}>
            <span {...stylex.props(styles.name)}>@dumbledore</span>
            <span>
              Transfiguration professor at Hogwarts — keeper of the Philosopher&apos;s Stone.
            </span>
            <span {...stylex.props(styles.muted)}>Joined September 1892</span>
          </div>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    // Hovering the trigger reveals the preview card.
    await userEvent.hover(canvas.getByRole('button', { name: '@dumbledore' }))
    await body.findByText('Joined September 1892')

    // Hovering away dismisses it.
    await userEvent.unhover(canvas.getByRole('button', { name: '@dumbledore' }))
    await waitFor(() => expect(body.queryByText('Joined September 1892')).toBeNull())
  }
}

/** Each side opens its own card; the popup flips when the canvas leaves it no room, so the side is not asserted. */
export const Sides: Story = {
  render: () => (
    <Axis axis='side' rows={sides}>
      {(side) => (
        <PreviewCard>
          <PreviewCardTrigger render={<Button variant='outline' />}>{side}</PreviewCardTrigger>
          <PreviewCardContent side={side}>Preview floats to the {side}</PreviewCardContent>
        </PreviewCard>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body)
    for (const side of sides) {
      const trigger = within(cellOf(canvasElement, 'side', side)).getByRole('button', {
        name: side
      })
      await userEvent.hover(trigger)
      await body.findByText(`Preview floats to the ${side}`)
      await userEvent.unhover(trigger)
      await waitFor(() => expect(body.queryByText(`Preview floats to the ${side}`)).toBeNull())
    }
  }
}
