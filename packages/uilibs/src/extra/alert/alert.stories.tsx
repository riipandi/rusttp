import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert.component'

const meta = {
  title: 'Extra Components/Alert',
  component: Alert,
  argTypes: {
    color: { control: 'select', options: ['neutral', 'primary', 'positive', 'warning', 'critical'] }
  },
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
  }
})

export default meta

export const Playground: Story = {
  args: { color: 'neutral' },
  render: (args) => (
    <Alert {...args} style={styles.alert}>
      <AlertTitle>Lumos!</AlertTitle>
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
        <Button size='xs' variant='outline'>
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
      <Alert style={styles.alert}>
        <AlertTitle>Polite by default</AlertTitle>
      </Alert>
      <Alert role='alert' color='critical' style={styles.alert}>
        <AlertTitle>Assertive on request</AlertTitle>
      </Alert>
      <Alert role={undefined} style={styles.alert}>
        <AlertTitle level={2}>Not announced</AlertTitle>
      </Alert>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Polite by default')
    await expect(canvas.getByRole('alert')).toHaveTextContent('Assertive on request')
    // The title level is configurable.
    await expect(
      canvas.getByRole('heading', { name: 'Not announced', level: 2 })
    ).toBeInTheDocument()
  }
}
