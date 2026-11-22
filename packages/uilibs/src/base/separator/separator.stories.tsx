import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, fontFamily, fontSize, fontWeight } from '../../styles/tokens.stylex'
import { Separator } from './separator.component'

const meta = {
  title: 'Base Components/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] }
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
} satisfies Meta<typeof Separator>

type Story = StoryObj<typeof meta>

const notifications = [
  { title: 'Your Gringotts vault statement is ready', time: '2h ago' },
  { title: 'Howler received from Molly Weasley', time: '4h ago' },
  { title: 'Daily Prophet morning edition is ready', time: '1d ago' }
]

const styles = stylex.create({
  insetBox: { display: 'flex', flexDirection: 'column', gap: 12, width: 240 },
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: 16
  },
  title: {
    fontWeight: fontWeight.medium
  },
  muted: {
    color: colors.foregroundNeutralFaded
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 16,
    height: 20
  },
  listRoot: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: 12,
    width: container.large
  },
  listRow: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between'
  },
  time: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  }
})

export default meta

export const Playground: Story = {
  render: () => (
    <div {...stylex.props(styles.root)}>
      <div>
        <div {...stylex.props(styles.title)}>Professor Robert Langdon</div>
        <div {...stylex.props(styles.muted)}>Symbologist, Harvard University.</div>
      </div>
      <Separator />
      <div {...stylex.props(styles.row)}>
        <span>Louvre</span>
        <Separator orientation='vertical' />
        <span>Vatican</span>
        <Separator orientation='vertical' />
        <span>CERN</span>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const separators = canvas.getAllByRole('separator')
    // One horizontal divider plus two vertical ones in the row.
    await expect(separators.length).toBe(3)
    await expect(separators[0]).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(separators[1]).toHaveAttribute('aria-orientation', 'vertical')
  }
}

export const Vertical: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <span>Louvre</span>
      <Separator orientation='vertical' />
      <span>Vatican</span>
      <Separator orientation='vertical' />
      <span>CERN</span>
    </div>
  )
}

export const List: Story = {
  render: () => (
    <div {...stylex.props(styles.listRoot)}>
      {notifications.map((item, index) => (
        <React.Fragment key={item.title}>
          {index > 0 && <Separator />}
          <div {...stylex.props(styles.listRow)}>
            <span {...stylex.props(styles.title)}>{item.title}</span>
            <span {...stylex.props(styles.time)}>{item.time}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export const Colors: Story = {
  render: () => (
    <Axis axis='color' rows={['neutral-faded', 'neutral'] as const}>
      {(color) => <Separator color={color} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const fill = (color: string) => {
      const line = canvasElement.querySelector(`[data-color="${color}"] [role="separator"]`)
      if (!line) throw new Error(`No separator for ${color}`)
      return getComputedStyle(line).backgroundColor
    }
    await expect(fill('neutral')).not.toBe(fill('neutral-faded'))
  }
}

export const Inset: Story = {
  render: () => (
    <div {...stylex.props(styles.insetBox)}>
      <Separator data-testid='full' />
      <Separator inset data-testid='inset' />
    </div>
  ),
  play: async ({ canvas }) => {
    const width = (id: string) => canvas.getByTestId(id).getBoundingClientRect().width
    // The inset line stops 12px short of each edge.
    await expect(width('full') - width('inset')).toBe(24)
  }
}
