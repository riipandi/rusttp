import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, waitFor } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, radius } from '../../styles/tokens.stylex'
import { AspectRatio } from './aspect-ratio.component'

const meta = {
  title: 'Extra Components/AspectRatio',
  component: AspectRatio
} satisfies Meta<typeof AspectRatio>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  frame: {
    maxWidth: '100%',
    width: container.large
  },
  smallFrame: {
    width: container.xxsmall
  },
  image: {
    borderRadius: radius.large,
    height: '100%',
    objectFit: 'cover',
    width: '100%'
  },
  placeholder: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.large,
    height: '100%',
    width: '100%'
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AspectRatio ratio={16 / 9}>
  <img src='…' alt='The Mona Lisa in the Louvre' />
</AspectRatio>`
      }
    },
    controls: { disable: false, include: ['ratio'] }
  },
  argTypes: {
    ratio: { control: { type: 'number', min: 0.5, step: 0.1 } }
  },
  args: { ratio: 16 / 9 },
  render: (args) => (
    <div {...stylex.props(styles.frame)}>
      <AspectRatio {...args}>
        <img
          src='https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80'
          alt='The Mona Lisa in the Louvre'
          {...stylex.props(styles.image)}
        />
      </AspectRatio>
    </div>
  )
}

const ratios = { '16:9': 16 / 9, '1:1': 1, '9:16': 9 / 16 } as const

export const Ratios: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AspectRatio ratio={9 / 16}>
  <div>…</div>
</AspectRatio>`
      }
    }
  },
  args: { ratio: 1 },
  render: () => (
    <Axis axis='ratio' rows={['16:9', '1:1', '9:16'] as const}>
      {(ratio) => (
        <div {...stylex.props(styles.smallFrame)}>
          <AspectRatio ratio={ratios[ratio]} data-testid={`ratio-${ratio}`}>
            <div {...stylex.props(styles.placeholder)} />
          </AspectRatio>
        </div>
      )}
    </Axis>
  ),
  // The box keeps its ratio whatever the content height. It is laid out after the first paint
  // under load, so wait for it instead of reading it once.
  play: async ({ canvas }) => {
    for (const [ratio, value] of Object.entries(ratios)) {
      const frame = canvas.getByTestId(`ratio-${ratio}`)
      await waitFor(async () => {
        const { width, height } = frame.getBoundingClientRect()
        await expect(width).toBeGreaterThan(0)
        await expect(Math.abs(width / height - value)).toBeLessThan(0.02)
      })
    }
  }
}
