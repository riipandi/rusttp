import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Button } from '../../base/button'
import { container } from '../../styles/tokens.stylex'
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert.component'

const meta = {
  title: 'Extra Components/Alert',
  component: Alert,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'primary', 'positive', 'warning', 'critical'] }
  },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div {...stylex.props(atoms.padding['20px'], atoms.minWidth['448px'], atoms.width['100%'])}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Alert>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  alert: {
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
  args: { tone: 'neutral' },
  render: (args) => (
    <Alert {...args} style={styles.alert}>
      <AlertTitle>Lumos!</AlertTitle>
      <AlertDescription>
        Point your wand and speak the incantation to light the darkest corridor.
      </AlertDescription>
    </Alert>
  )
}

export const Critical: Story = {
  args: { tone: 'critical', role: 'alert' },
  render: (args) => (
    <Alert {...args} style={styles.alert}>
      <AlertTitle>Illuminati threat detected</AlertTitle>
      <AlertDescription>
        An antimatter canister is armed inside Vatican City. Alert the Swiss Guard.
      </AlertDescription>
    </Alert>
  )
}

export const Action: Story = {
  args: { tone: 'neutral' },
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

const tones = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

export const Tones: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      {tones.map((tone) => (
        <Alert key={tone} tone={tone} style={styles.alert}>
          <AlertTitle>{`Owl post: ${tone}`}</AlertTitle>
          <AlertDescription>A message from the Owl Office, in the {tone} tone.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Every tone keeps the title and description readable (the gate checks the contrast).
    for (const tone of tones) {
      await expect(canvas.getByRole('heading', { name: `Owl post: ${tone}` })).toBeInTheDocument()
    }
  }
}

export const Roles: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Alert style={styles.alert}>
        <AlertTitle>Polite by default</AlertTitle>
      </Alert>
      <Alert role='alert' tone='critical' style={styles.alert}>
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
