import { Info } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect } from 'storybook/test'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, radius, unit } from '../../styles/tokens.stylex'
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert.component'
import { alertColors } from './alert.stylex'

const meta = {
  title: 'Extra Components/Alert',
  component: Alert,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Alert>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  alert: {
    maxWidth: '100%',
    width: container.xlarge
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  // A padded panel for `bleed` to run out of: 4 unit steps is 16px, the panel's padding.
  panel: {
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.large,
    borderStyle: 'solid',
    borderWidth: 1,
    maxWidth: '100%',
    padding: unit.x4,
    width: container.xlarge
  }
})

export default meta

// `title` is the text of `AlertTitle`; the root's own `title` attribute is not used.
type PlaygroundArgs = ComponentProps<typeof Alert> & { title: string }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['title', 'color'] } },
  argTypes: {
    title: { control: 'text' },
    color: { control: 'select', options: Object.keys(alertColors) }
  },
  args: { title: 'Lumos!', color: 'neutral' },
  render: ({ title, ...args }) => (
    <Alert {...args} style={styles.alert}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        Point your wand and speak the incantation to light the darkest corridor.
      </AlertDescription>
    </Alert>
  )
}

export const Action: Story = {
  args: { color: 'neutral' },
  render: (args) => (
    <Alert {...args} style={styles.alert}>
      <AlertTitle>Spell recorded</AlertTitle>
      <AlertDescription>
        Expecto Patronum cast successfully. Your patronus is on file with the Ministry.
      </AlertDescription>
      <AlertAction>
        <Button size='xsmall' variant='outline'>
          Reversal
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvas }) => {
    // Title, description, and action all render inside the alert.
    await expect(canvas.getByRole('heading', { name: 'Spell recorded' })).toBeInTheDocument()
    await expect(canvas.getByText(/patronus is on file/i)).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Reversal' })).toBeEnabled()
  }
}

const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

export const Colors: Story = {
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => (
        <Alert color={color} style={styles.alert}>
          <AlertTitle>{`Owl post: ${color}`}</AlertTitle>
          <AlertDescription>A message from the Owl Office, in {color}.</AlertDescription>
        </Alert>
      )}
    </Axis>
  ),
  play: async ({ canvasElement, canvas }) => {
    // Every color keeps the title and description readable (the gate checks the contrast).
    const looks = new Set<string>()
    for (const color of colorNames) {
      await expect(canvas.getByRole('heading', { name: `Owl post: ${color}` })).toBeInTheDocument()
      const style = getComputedStyle(
        cellOf(canvasElement, 'color', color).firstElementChild ?? canvasElement
      )
      looks.add(`${style.backgroundColor}|${style.borderTopColor}`)
    }
    await expect(looks.size).toBe(colorNames.length)
  }
}

export const Roles: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Alert announce style={styles.alert}>
        <AlertTitle>Polite on request</AlertTitle>
      </Alert>
      <Alert role='alert' color='critical' style={styles.alert}>
        <AlertTitle>Assertive on request</AlertTitle>
      </Alert>
      <Alert style={styles.alert}>
        <AlertTitle level={2}>Not announced</AlertTitle>
      </Alert>
    </div>
  ),
  play: async ({ canvas }) => {
    // Only the two opt-ins are live regions: the plain notice has no role.
    await expect(canvas.getAllByRole('status')).toHaveLength(1)
    await expect(canvas.getByRole('status')).toHaveTextContent('Polite on request')
    await expect(canvas.getAllByRole('alert')).toHaveLength(1)
    await expect(canvas.getByRole('alert')).toHaveTextContent('Assertive on request')
    // The title level is configurable.
    await expect(
      canvas.getByRole('heading', { name: 'Not announced', level: 2 })
    ).toBeInTheDocument()
  }
}

/** A glyph before the text, the action beside it, and the notice running out of its parent. */
export const Layouts: Story = {
  render: () => (
    <Axis axis='layout' rows={['icon', 'inline', 'bleed'] as const} wide>
      {(layout) => {
        if (layout === 'icon') {
          return (
            <Alert data-alert icon={Info} color='primary' style={styles.alert}>
              <AlertTitle>Floo powder</AlertTitle>
              <AlertDescription>Say your destination clearly before you step in.</AlertDescription>
            </Alert>
          )
        }
        if (layout === 'inline') {
          return (
            <Alert data-alert inline style={styles.alert}>
              <AlertTitle>Owl delivered</AlertTitle>
              <AlertDescription>Your letter from Hogwarts has arrived.</AlertDescription>
              <AlertAction>
                <Button size='xsmall' variant='outline'>
                  Open
                </Button>
              </AlertAction>
            </Alert>
          )
        }
        return (
          <div {...stylex.props(styles.panel)}>
            <Alert data-alert bleed={4} color='warning'>
              <AlertTitle>Restricted Section</AlertTitle>
              <AlertDescription>Readers need a signed note from a professor.</AlertDescription>
            </Alert>
          </div>
        )
      }}
    </Axis>
  ),
  play: async ({ canvasElement, canvas }) => {
    const alertOf = (layout: string) => {
      const el = cellOf(canvasElement, 'layout', layout).querySelector('[data-alert]')
      if (!(el instanceof HTMLElement)) throw new Error(`No alert for ${layout}`)
      return el
    }

    // The glyph is decoration and comes before the text.
    const icon = alertOf('icon')
    await expect(icon.firstElementChild?.tagName.toLowerCase()).toBe('svg')
    await expect(icon.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.getByRole('heading', { name: 'Floo powder' })).toBeInTheDocument()

    // Inline: the action is part of the row, not pinned over the text; it sits beside the text, or
    // under it when the notice is too narrow for both.
    const inline = alertOf('inline')
    const open = canvas.getByRole('button', { name: 'Open' })
    const action = open.parentElement
    if (!action) throw new Error('No action slot')
    await expect(getComputedStyle(action).position).toBe('static')
    const description = canvas
      .getByText('Your letter from Hogwarts has arrived.')
      .getBoundingClientRect()
    const slot = action.getBoundingClientRect()
    await expect(slot.left >= description.right || slot.top >= description.bottom).toBe(true)
    await expect(inline.contains(action)).toBe(true)

    // Bleed: the notice spans its panel edge to edge, with no side edges and square corners.
    const bleed = alertOf('bleed')
    const panel = bleed.parentElement
    if (!panel) throw new Error('No panel')
    await expect(bleed.getBoundingClientRect().width).toBe(panel.getBoundingClientRect().width - 2)
    await expect(getComputedStyle(bleed).borderInlineStartWidth).toBe('0px')
    await expect(getComputedStyle(bleed).borderTopLeftRadius).toBe('0px')
  }
}
