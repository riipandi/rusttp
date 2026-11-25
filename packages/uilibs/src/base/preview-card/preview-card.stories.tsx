import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
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

type PlaygroundArgs = ComponentProps<typeof PreviewCard> &
  Pick<ComponentProps<typeof PreviewCardContent>, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['side', 'sideOffset', 'align', 'alignOffset'] },
    docs: {
      source: {
        code: `<PreviewCard>
  <PreviewCardTrigger render={<Button variant='ghost' />}>@dumbledore</PreviewCardTrigger>
  <PreviewCardContent side='bottom' align='center'>
    <Avatar>
      <AvatarImage src='…' alt='@dumbledore' />
      <AvatarFallback>AD</AvatarFallback>
    </Avatar>
    <span>@dumbledore</span>
    <span>Transfiguration professor at Hogwarts — keeper of the Philosopher's Stone.</span>
  </PreviewCardContent>
</PreviewCard>`
      }
    }
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' }
  },
  args: { side: 'bottom', sideOffset: 4, align: 'center', alignOffset: 4 },
  render: ({ side, sideOffset, align, alignOffset, ...args }) => (
    <PreviewCard {...args}>
      <PreviewCardTrigger render={<Button variant='ghost' />}>@dumbledore</PreviewCardTrigger>
      <PreviewCardContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
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
  parameters: {
    docs: {
      source: {
        code: `<PreviewCard>
  <PreviewCardTrigger render={<Button variant='outline' />}>top</PreviewCardTrigger>
  <PreviewCardContent side='top'>Preview floats to the top</PreviewCardContent>
</PreviewCard>`
      }
    }
  },
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

function Profile({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <PreviewCard defaultOpen={defaultOpen}>
      <PreviewCardTrigger render={<Button variant='ghost' />}>@dumbledore</PreviewCardTrigger>
      <PreviewCardContent>
        <div {...stylex.props(styles.info)}>
          <span {...stylex.props(styles.name)}>@dumbledore</span>
          <span>Transfiguration professor at Hogwarts.</span>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  )
}

// The a11y gate runs after `play`, when a card a play opened has closed again: this story keeps the
// card open so the gate checks it.
export const Open: Story = {
  render: () => <Profile defaultOpen />,
  play: async () => {
    const card = await within(document.body).findByText('Transfiguration professor at Hogwarts.')
    await waitFor(() => expect(card).toBeVisible())
  }
}

/** Focusing the trigger opens the card, and Escape closes it. */
export const Keyboard: Story = {
  render: () => <Profile />,
  play: async ({ canvas }) => {
    const body = within(document.body)
    const trigger = canvas.getByRole('button', { name: '@dumbledore' })
    const card = () => body.queryByText('Transfiguration professor at Hogwarts.')

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(card()).toBeVisible())

    await pressUntil('{Escape}', () => expect(card()).toBeNull())
    await expect(trigger).toHaveFocus()
  }
}
