import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { frameOf, ViewportFrame } from '../../contracts/viewport-frame'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontSize, radius, unit } from '../../styles/tokens.stylex'
import { Hidden } from './hidden.component'

const meta = {
  title: 'Extra Components/Hidden',
  component: Hidden,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Hidden>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  tile: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    paddingBlock: unit.x2,
    paddingInline: unit.x4
  },
  row: { display: 'flex', gap: unit.x2 },
  col: { display: 'flex', flexDirection: 'column', gap: unit.x4 }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['hide'] } },
  argTypes: { hide: { control: 'boolean' } },
  args: { hide: false },
  render: (args) => (
    <Hidden {...args} data-testid='hidden'>
      <div {...stylex.props(styles.tile)}>The Marauder's Map</div>
    </Hidden>
  ),
  play: async ({ canvas, args }) => {
    await expect(getComputedStyle(canvas.getByTestId('hidden')).display).toBe(
      args.hide ? 'none' : 'contents'
    )
  }
}

/** Each frame is a viewport of its own width, so its media queries see that width. */
export const Responsive: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Hidden hide={{ medium: true }}>
  <div>Phone</div>
</Hidden>

<Hidden hide={{ small: true, medium: false, large: true }}>
  <div>Tablet</div>
</Hidden>

<Hidden hide={{ small: true, large: false }}>
  <div>Desktop</div>
</Hidden>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.col)}>
      {[390, 700, 1000, 1300].map((width) => (
        <ViewportFrame key={width} title={`${width} px viewport`} width={width} height={56}>
          <div {...stylex.props(styles.row)}>
            <Hidden data-testid='phone' hide={{ medium: true }}>
              <div {...stylex.props(styles.tile)}>Phone</div>
            </Hidden>
            <Hidden data-testid='tablet' hide={{ small: true, medium: false, large: true }}>
              <div {...stylex.props(styles.tile)}>Tablet</div>
            </Hidden>
            <Hidden data-testid='desktop' hide={{ small: true, large: false }}>
              <div {...stylex.props(styles.tile)}>Desktop</div>
            </Hidden>
          </div>
        </ViewportFrame>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // One block shows per width: the phone block below 660 px, the tablet block from 660 px, and
    // the desktop block from 900 px, each replacing the one before.
    const cases = [
      { width: 390, phone: 'contents', tablet: 'none', desktop: 'none' },
      { width: 700, phone: 'none', tablet: 'contents', desktop: 'none' },
      { width: 1000, phone: 'none', tablet: 'none', desktop: 'contents' },
      { width: 1300, phone: 'none', tablet: 'none', desktop: 'contents' }
    ]
    for (const { width, ...expected } of cases) {
      const { doc, computed } = await frameOf(canvasElement, width)
      for (const [name, display] of Object.entries(expected)) {
        const element = doc.querySelector(`[data-testid="${name}"]`)
        if (!element) throw new Error(`No ${name} block at ${width} px`)
        await expect(computed(element).display).toBe(display)
      }
    }
  }
}

/** A hidden block leaves the accessibility tree too, so it is never announced twice. */
export const Hiding: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Hidden hide>
  <div>Never visible</div>
</Hidden>

<Hidden>
  <div>Always visible</div>
</Hidden>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Hidden hide>
        <div {...stylex.props(styles.tile)}>Never visible</div>
      </Hidden>
      <Hidden>
        <div {...stylex.props(styles.tile)}>Always visible</div>
      </Hidden>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Always visible')).toBeVisible()
    await expect(canvas.getByText('Never visible')).not.toBeVisible()
  }
}

/** `render` swaps the element, such as a navigation landmark that shows on desktop only. */
export const Render: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Hidden render={<nav aria-label='Houses' />} hide={{ small: false, xlarge: true }}>
  <div>Gryffindor, Slytherin</div>
</Hidden>`
      }
    }
  },
  render: () => (
    <Hidden render={<nav aria-label='Houses' />} hide={{ small: false, xlarge: true }}>
      <div {...stylex.props(styles.tile)}>Gryffindor, Slytherin</div>
    </Hidden>
  ),
  play: async ({ canvas }) => {
    // The test window is wider than `xlarge` or not; the landmark is a nav either way.
    const nav = canvas.queryByRole('navigation', { name: 'Houses' })
    const hidden = canvas.getByText('Gryffindor, Slytherin').parentElement
    if (!hidden) throw new Error('No Hidden element')
    await expect(hidden.tagName).toBe('NAV')
    if (getComputedStyle(hidden).display === 'none') await expect(nav).toBeNull()
    else await expect(nav).not.toBeNull()
  }
}
