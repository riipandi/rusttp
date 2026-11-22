import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Button } from '../../base/button'
import { colors } from '../../styles/colors.stylex'
import { Badge } from '../badge'
import { Spinner } from './spinner.component'

const meta = {
  title: 'Extra Components/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
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
} satisfies Meta<typeof Spinner>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  iconXs: { height: 14, width: 14 },
  iconLg: { height: 24, width: 24 },
  spinnerSm: { height: 12, width: 12 },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 16
  },
  stack: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  line: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    gap: 8,
    margin: 0
  }
})

export default meta

export const Playground: Story = {
  render: () => (
    <Button disabled>
      <Spinner /> Divining…
    </Button>
  ),
  // Inside a Button the spinner is decoration: the button keeps its own name and there is no
  // second live region.
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Divining…' })
    await expect(button).toBeDisabled()
    await expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.queryByRole('status')).toBeNull()
  }
}

export const Alone: Story = {
  render: () => <Spinner labels={{ loading: 'Consulting the Marauder’s Map' }} />,
  // On its own it is a polite live region with the given name.
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Consulting the Marauder’s Map' })
    ).toBeInTheDocument()
  }
}

export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Spinner style={styles.iconXs} />
      <Spinner />
      <Spinner style={styles.iconLg} />
    </div>
  )
}

export const Composition: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Badge variant='faded'>
        <Spinner {...stylex.props(styles.spinnerSm)} />
        Brewing
      </Badge>
      <p {...stylex.props(styles.line)}>
        <Spinner />
        Decoding the cryptex…
      </p>
    </div>
  )
}
