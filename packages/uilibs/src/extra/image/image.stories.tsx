import { Image as ImageIcon } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Image, type ImageBorderRadius, type ImageDisplayMode } from './image.component'

const meta = {
  title: 'Extra Components/Image',
  component: Image,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Image>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  frame: { maxWidth: '100%', width: container.large },
  small: { maxWidth: '100%', width: container.xxsmall },
  stack: { alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16 }
})

export default meta

/** A wide picture drawn inline, so no story waits on the network: 400 by 200, split in two colors. */
const banner =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">' +
      '<rect width="200" height="200" fill="#7f0909"/><rect x="200" width="200" height="200" fill="#ffc500"/>' +
      '</svg>'
  )

/** Nothing decodes from this, so the `img` fires `error`. */
const broken = 'data:image/png;base64,Hogwarts'

const displayModeNames = ['cover', 'contain'] as const satisfies ReadonlyArray<ImageDisplayMode>
const radiusNames = [
  'none',
  'small',
  'medium',
  'large',
  'full'
] as const satisfies ReadonlyArray<ImageBorderRadius>

/** The picture has failed once the `img` is gone; `error` fires after the first paint. */
async function failed(root: HTMLElement, count = 0) {
  await waitFor(() => expect(root.querySelectorAll('img')).toHaveLength(count))
}

function imgOf(root: HTMLElement) {
  const img = root.querySelector('img')
  if (!img) throw new Error('No img rendered')
  return img
}

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: ['src', 'alt', 'aspectRatio', 'borderRadius', 'displayMode']
    }
  },
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    aspectRatio: { control: { type: 'number', min: 0.5, step: 0.1 } },
    borderRadius: { control: 'radio', options: radiusNames },
    displayMode: { control: 'radio', options: displayModeNames }
  },
  args: {
    src: banner,
    alt: 'The Gryffindor and Hufflepuff banners',
    aspectRatio: 1,
    borderRadius: 'medium',
    displayMode: 'cover'
  },
  render: (args) => (
    <div {...stylex.props(styles.frame)}>
      <Image {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const img = imgOf(canvasElement)
    await waitFor(() => expect(img.getBoundingClientRect().width).toBeGreaterThan(0))
    const { width, height } = img.getBoundingClientRect()
    // The box is square, whatever the picture's own 2:1.
    await expect(Math.abs(width / height - 1)).toBeLessThan(0.02)
  }
}

/** `cover` crops the picture to fill the box; `contain` fits all of it, with bars at the sides. */
export const DisplayModes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Image src={banner} alt='The banners, contain' aspectRatio={1} displayMode='contain' />`
      }
    }
  },
  args: { src: banner, alt: '' },
  render: () => (
    <Axis axis='mode' rows={displayModeNames}>
      {(displayMode) => (
        <div {...stylex.props(styles.small)}>
          <Image
            src={banner}
            alt={`The banners, ${displayMode}`}
            aspectRatio={1}
            displayMode={displayMode}
          />
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const mode of displayModeNames) {
      const img = imgOf(cellOf(canvasElement, 'mode', mode))
      await expect(getComputedStyle(img).objectFit).toBe(mode)
      // Both fill the box; the fit is what differs.
      await waitFor(() => expect(img.getBoundingClientRect().height).toBeGreaterThan(0))
      await expect(
        Math.abs(img.getBoundingClientRect().width / img.getBoundingClientRect().height - 1)
      ).toBeLessThan(0.02)
    }
  }
}

export const BorderRadii: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Image src={banner} alt='The banners, large corners' aspectRatio={1} borderRadius='large' />`
      }
    }
  },
  args: { src: banner, alt: '' },
  render: () => (
    <Axis axis='radius' rows={radiusNames}>
      {(borderRadius) => (
        <div {...stylex.props(styles.small)}>
          <Image
            src={banner}
            alt={`The banners, ${borderRadius} corners`}
            aspectRatio={1}
            borderRadius={borderRadius}
          />
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const radiusOf = (name: string) => {
      const box = imgOf(cellOf(canvasElement, 'radius', name)).parentElement
      if (!box) throw new Error(`No box for ${name}`)
      return Number.parseFloat(getComputedStyle(box).borderTopLeftRadius)
    }
    await expect(radiusOf('none')).toBe(0)
    await expect(radiusOf('small')).toBeLessThan(radiusOf('medium'))
    await expect(radiusOf('medium')).toBeLessThan(radiusOf('large'))
    await expect(radiusOf('large')).toBeLessThan(radiusOf('full'))
  }
}

/** A source that fails keeps the box and its ratio, and `fallback` fills it. */
export const Fallback: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Image
  src={src}
  alt='The Marauder’s Map'
  aspectRatio={16 / 9}
  fallback={<ImageIcon size={24} aria-hidden />}
/>`
      }
    }
  },
  args: { src: broken, alt: '' },
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.small)} data-testid='with-fallback'>
        <Image
          src={broken}
          alt='The Marauder’s Map'
          aspectRatio={16 / 9}
          borderRadius='large'
          fallback={<ImageIcon size={24} aria-hidden />}
        />
      </div>
      <div {...stylex.props(styles.small)} data-testid='without-fallback'>
        <Image src={broken} alt='The Pensieve' aspectRatio={1} />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The `img` is replaced by a named box.
    await failed(canvasElement)
    const map = canvas.getByRole('img', { name: 'The Marauder’s Map' })
    await expect(map.querySelector('svg')).not.toBeNull()
    await waitFor(() => expect(map.getBoundingClientRect().height).toBeGreaterThan(0))
    // The box keeps the ratio the picture would have had, with or without a fallback.
    const ratio = (name: string) => {
      const { width, height } = canvas.getByRole('img', { name }).getBoundingClientRect()
      return width / height
    }
    await expect(Math.abs(ratio('The Marauder’s Map') - 16 / 9)).toBeLessThan(0.02)
    await expect(Math.abs(ratio('The Pensieve') - 1)).toBeLessThan(0.02)
  }
}

/** A new `src` after a failure gets a new try. */
export const Recovery: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Image src={src} alt='The Room of Requirement' aspectRatio={2} fallback='Not found' />`
      }
    }
  },
  args: { src: broken, alt: '' },
  render: () => {
    const [src, setSrc] = React.useState(broken)
    return (
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.small)}>
          <Image src={src} alt='The Room of Requirement' aspectRatio={2} fallback='Not found' />
        </div>
        <Button variant='outline' onClick={() => setSrc(banner)}>
          Load the picture
        </Button>
      </div>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    await failed(canvasElement)
    await expect(canvas.getByRole('img', { name: 'The Room of Requirement' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Load the picture' }))
    await waitFor(() => expect(canvasElement.querySelector('img')).not.toBeNull())
    await expect(canvas.queryByText('Not found')).toBeNull()
  }
}

/** A picture that only decorates takes `alt=''`; a fallback for it is hidden from assistive technology too. */
export const Decorative: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Image src={banner} alt='' aspectRatio={2} />

<Image src={src} alt='' aspectRatio={2} fallback='Decoration' />`
      }
    }
  },
  args: { src: banner, alt: '' },
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.small)}>
        <Image src={banner} alt='' aspectRatio={2} />
      </div>
      <div {...stylex.props(styles.small)}>
        <Image src={broken} alt='' aspectRatio={2} fallback='Decoration' />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await failed(canvasElement, 1)
    await expect(canvasElement.querySelector('img')).toHaveAttribute('alt', '')
    const fallback = await waitFor(() => {
      const found = canvasElement.querySelector('[data-slot="image-fallback"]')
      if (!found) throw new Error('The decorative fallback has not shown')
      return found
    })
    await expect(fallback).toHaveAttribute('aria-hidden', 'true')
    await expect(fallback).not.toHaveAttribute('role')
  }
}

/** Without a ratio the box takes the picture's own height. */
export const NaturalHeight: Story = {
  parameters: {
    docs: { source: { code: `<Image src={banner} alt='The banners, at their own height' />` } }
  },
  args: { src: banner, alt: '' },
  render: () => (
    <div {...stylex.props(styles.small)}>
      <Image src={banner} alt='The banners, at their own height' />
    </div>
  ),
  play: async ({ canvas }) => {
    const img = canvas.getByRole('img', { name: 'The banners, at their own height' })
    await waitFor(() => expect(img.getBoundingClientRect().height).toBeGreaterThan(0))
    const { width, height } = img.getBoundingClientRect()
    await expect(Math.abs(width / height - 2)).toBeLessThan(0.05)
  }
}
