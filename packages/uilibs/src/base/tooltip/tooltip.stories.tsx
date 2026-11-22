import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { colors } from '../../styles/colors.stylex'
import { Button } from '../button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.component'

const meta = {
  title: 'Base Components/Tooltip',
  component: TooltipProvider,
  parameters: { layout: 'centered' },
  argTypes: {
    delay: { control: 'number' }
  },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div
        {...stylex.props(
          atoms.display.flex,
          atoms.justifyContent.center,
          atoms.padding['20px'],
          atoms.minWidth['448px'],
          atoms.width['100%']
        )}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof TooltipProvider>

type Story = StoryObj<typeof meta>

const sides = ['top', 'right', 'bottom', 'left'] as const

const styles = stylex.create({
  pair: { display: 'flex', gap: 160, paddingTop: 64 },
  neutralSurface: { backgroundColor: colors.backgroundElevationOverlay, height: 1, width: 1 },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  // Disabled native buttons don't fire pointer events, so the tooltip
  // trigger has to be the wrapping span instead of the button itself.
  trigger: {
    display: 'inline-block'
  }
})

export default meta

export const Playground: Story = {
  args: { delay: 0 },
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant='outline' />}>Lumos</TooltipTrigger>
        <TooltipContent>Add to the Restricted Section</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const trigger = canvas.getByRole('button', { name: 'Lumos' })

    // Hovering opens the tooltip (delay is 0 in this story).
    await userEvent.hover(trigger)
    await waitFor(() => expect(body.getByText('Add to the Restricted Section')).toBeVisible())

    // Hovering away dismisses it.
    await userEvent.unhover(trigger)
    await waitFor(() => expect(body.queryByText('Add to the Restricted Section')).toBeNull())
  }
}

// The a11y gate runs after `play`, when Playground's tooltip is closed again: this story keeps the
// popup, its surface, and its arrow open so the gate checks them.
export const Open: Story = {
  args: { delay: 0 },
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant='outline' />}>Nox</TooltipTrigger>
        <TooltipContent>Extinguish the wand light</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async () => {
    await waitFor(() =>
      expect(within(document.body).getByText('Extinguish the wand light')).toBeVisible()
    )
  }
}

export const Sides: Story = {
  args: { delay: 0 },
  render: () => (
    <TooltipProvider>
      <div {...stylex.props(styles.row)}>
        {sides.map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger render={<Button variant='outline' />}>{side}</TooltipTrigger>
            <TooltipContent side={side}>Reveals the {side} of the map</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

export const DisabledButton: Story = {
  name: 'Disabled button',
  args: { delay: 0 },
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span {...stylex.props(styles.trigger)} />}>
          <Button variant='outline' disabled>
            Alohomora
          </Button>
        </TooltipTrigger>
        <TooltipContent>Speak the riddle to unlock the door</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** The inverted surface, open so the a11y gate checks its contrast; the probe is the neutral one. */
export const Colors: Story = {
  render: () => (
    <TooltipProvider>
      <div {...stylex.props(styles.pair)}>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button variant='outline' />}>inverted</TooltipTrigger>
          <TooltipContent color='inverted'>Tooltip inverted</TooltipContent>
        </Tooltip>
        <div data-testid='neutral-surface' {...stylex.props(styles.neutralSurface)} />
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const inverted = await body.findByText('Tooltip inverted')
    await expect(getComputedStyle(inverted).backgroundColor).not.toBe(
      getComputedStyle(canvas.getByTestId('neutral-surface')).backgroundColor
    )
  }
}
