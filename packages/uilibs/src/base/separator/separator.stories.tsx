import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, fontFamily, fontSize, fontWeight } from '../../styles/tokens.stylex'
import { Separator } from './separator.component'

const meta = {
  title: 'Base Components/Separator',
  component: Separator
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
    maxWidth: '100%',
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
  // Both separators of each orientation take the args; `Orientations` shows the orientation axis.
  parameters: { controls: { disable: false, include: ['color', 'inset'] } },
  argTypes: {
    color: { control: 'radio', options: ['neutral-faded', 'neutral'] },
    inset: { control: 'boolean' }
  },
  args: { color: 'neutral-faded', inset: false },
  render: (args) => (
    <div {...stylex.props(styles.root)}>
      <div>
        <div {...stylex.props(styles.title)}>Professor Robert Langdon</div>
        <div {...stylex.props(styles.muted)}>Symbologist, Harvard University.</div>
      </div>
      <Separator {...args} />
      <div {...stylex.props(styles.row)}>
        <span>Louvre</span>
        <Separator {...args} orientation='vertical' />
        <span>Vatican</span>
        <Separator {...args} orientation='vertical' />
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
    // A separator takes no focus and answers no keys.
    await userEvent.tab()
    await expect(document.body).toHaveFocus()
  }
}

export const Orientations: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div>
  <span>Louvre</span>
  <Separator />
  <span>Vatican</span>
</div>

<div>
  <span>Louvre</span>
  <Separator orientation='vertical' />
  <span>Vatican</span>
</div>`
      }
    }
  },
  render: () => (
    <Axis axis='orientation' rows={['horizontal', 'vertical'] as const}>
      {(orientation) =>
        orientation === 'horizontal' ? (
          <div {...stylex.props(styles.root)}>
            <span>Louvre</span>
            <Separator />
            <span>Vatican</span>
          </div>
        ) : (
          <div {...stylex.props(styles.row)}>
            <span>Louvre</span>
            <Separator orientation='vertical' />
            <span>Vatican</span>
          </div>
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const box = (orientation: string) => {
      const line = cellOf(canvasElement, 'orientation', orientation).querySelector(
        '[role="separator"]'
      )
      if (!line) throw new Error(`No ${orientation} separator`)
      return line.getBoundingClientRect()
    }
    // A horizontal line is wider than it is tall; a vertical one the other way round.
    await expect(box('horizontal').width).toBeGreaterThan(box('horizontal').height)
    await expect(box('vertical').height).toBeGreaterThan(box('vertical').width)
  }
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
  parameters: {
    docs: {
      source: {
        code: `<Separator color='neutral-faded' />
<Separator color='neutral' />`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Separator />
<Separator inset />`
      }
    }
  },
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
