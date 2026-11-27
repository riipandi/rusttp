import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontSize, radius, unit } from '../../styles/tokens.stylex'
import { Container } from './container.component'
import { containerSizes } from './container.stylex'

const meta = {
  title: 'Extra Components/Container',
  component: Container
} satisfies Meta<typeof Container>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  page: {
    backgroundColor: colors.backgroundNeutralFaded,
    borderRadius: radius.medium,
    paddingBlock: unit.x2
  },
  content: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.small,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    padding: unit.x3
  },
  col: { display: 'flex', flexDirection: 'column', gap: unit.x3 }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'padding'] } },
  argTypes: {
    size: { control: 'select', options: Object.keys(containerSizes) },
    padding: { control: 'select', options: [0, 2, 4, 6] }
  },
  args: { size: 'small', padding: 3 },
  render: (args) => (
    <div {...stylex.props(styles.page)}>
      <Container {...args} data-testid='container'>
        <div {...stylex.props(styles.content)}>The Priory of Sion</div>
      </Container>
    </div>
  ),
  play: async ({ canvas, args }) => {
    const style = getComputedStyle(canvas.getByTestId('container'))
    await expect(style.padding).toBe(`${Number(args.padding) * 4}px`)
    await expect(style.maxWidth).not.toBe('none')
  }
}

/** The tokens are 10rem to 32rem, and the container centers in its parent. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Container size='medium'>
  <div>medium</div>
</Container>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.col)}>
      {Object.keys(containerSizes).map((size) => (
        <div key={size} data-testid={`parent-${size}`} {...stylex.props(styles.page)}>
          <Container size={size} data-testid={`size-${size}`}>
            <div {...stylex.props(styles.content)}>{size}</div>
          </Container>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const widest: Record<string, string> = {
      xxsmall: '160px',
      xsmall: '256px',
      small: '288px',
      medium: '320px',
      large: '384px',
      xlarge: '448px',
      xxlarge: '512px'
    }
    for (const [size, px] of Object.entries(widest)) {
      await expect(getComputedStyle(canvas.getByTestId(`size-${size}`)).maxWidth).toBe(px)
    }
    // Narrower than its parent, it sits in the middle: the space on both sides is equal.
    const box = canvas.getByTestId('size-xxsmall').getBoundingClientRect()
    const parent = canvas.getByTestId('parent-xxsmall').getBoundingClientRect()
    await expect(box.width).toBeLessThan(parent.width)
    await expect(Math.abs(box.left - parent.left - (parent.right - box.right))).toBeLessThan(1)
  }
}

/** A size beyond the tokens is a CSS length. */
export const Length: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Container size='60ch'>
  <div>Any length works: a reading column of 60ch.</div>
</Container>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.page)}>
      <Container size='60ch' data-testid='container'>
        <div {...stylex.props(styles.content)}>Any length works: a reading column of 60ch.</div>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    const container = canvas.getByTestId('container')
    // `ch` resolves against the font: the computed value is the resolved length, never `60ch`.
    await expect(getComputedStyle(container).maxWidth).toMatch(/^\d+(\.\d+)?px$/)
  }
}

/** `padding` counts `unit` steps, like Stack's `gap`. */
export const Padding: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Container size='medium' padding={4}>
  <div>16px on every side</div>
</Container>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.page)}>
      <Container size='medium' padding={4} data-testid='container'>
        <div {...stylex.props(styles.content)}>16px on every side</div>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('container')).padding).toBe('16px')
  }
}

/** `render` swaps the element, such as the page's `main`. */
export const Render: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Container render={<section aria-label='Reading column' />} size='medium'>
  <div>A section that is a centered column</div>
</Container>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.page)}>
      <Container render={<section aria-label='Reading column' />} size='medium'>
        <div {...stylex.props(styles.content)}>A section that is a centered column</div>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Reading column' }).tagName).toBe('SECTION')
  }
}
