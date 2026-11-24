import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, waitFor } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import {
  container,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  stroke
} from '../../styles/tokens.stylex'
import { Separator } from '../separator'
import { ScrollArea } from './scroll-area.component'

const meta = {
  title: 'Base Components/ScrollArea',
  component: ScrollArea,
  tags: [] // ['autodocs']
} satisfies Meta<typeof ScrollArea>

type Story = StoryObj<typeof meta>

const tags = Array.from({ length: 50 }, (_, i) => `Daily Prophet edition ${50 - i}`)

const styles = stylex.create({
  root: {
    borderColor: colors.borderNeutral,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    height: container.small,
    width: container.xsmall
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: 8,
    padding: 16
  },
  heading: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    margin: 0
  },
  tag: {
    fontSize: fontSize.body2
  },
  box: {
    borderColor: colors.borderNeutral,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    height: container.xsmall,
    maxWidth: '100%',
    width: container.xlarge
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: 8,
    padding: 16,
    // Wider than the box, so there is something to scroll sideways.
    width: 640
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['fade', 'orientation', 'scrollbarDisplay'] }
  },
  argTypes: {
    fade: { control: 'boolean' },
    orientation: { control: 'radio', options: ['vertical', 'horizontal', 'both'] },
    scrollbarDisplay: { control: 'radio', options: ['hover', 'scroll', 'visible', 'hidden'] }
  },
  args: { fade: true, orientation: 'vertical', scrollbarDisplay: 'hover' },
  render: (args) => (
    <ScrollArea {...args} style={styles.root}>
      <div {...stylex.props(styles.inner)}>
        <h4 {...stylex.props(styles.heading)}>Daily Prophet editions</h4>
        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div {...stylex.props(styles.tag)}>{tag}</div>
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  ),
  // All 50 editions are rendered — the viewport clips, not the DOM.
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText(/^Daily Prophet edition \d+$/).length).toBe(50)
  }
}

const orientations = ['vertical', 'horizontal', 'both'] as const

/** One scrollbar per axis, and a corner where two meet; `both` scrolls on both axes. */
export const Orientations: Story = {
  render: () => (
    <Axis axis='orientation' rows={orientations} wide>
      {(orientation) => (
        <ScrollArea style={styles.box} orientation={orientation}>
          <div {...stylex.props(styles.grid)}>
            {tags.slice(0, 20).map((tag) => (
              <div key={tag} {...stylex.props(styles.tag)}>
                {tag}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const area = (orientation: string) => cellOf(canvasElement, 'orientation', orientation)
    const bars = (orientation: string) =>
      Array.from(
        new Set(
          Array.from(area(orientation).querySelectorAll('[data-orientation]')).map((el) =>
            el.getAttribute('data-orientation')
          )
        )
      )
    // The scrollbars mount once Base UI has measured the content.
    await waitFor(() => expect(bars('both')).toHaveLength(2))
    await expect(bars('vertical')).toEqual(['vertical'])
    await expect(bars('horizontal')).toEqual(['horizontal'])
    await expect(bars('both')).toEqual(expect.arrayContaining(['horizontal', 'vertical']))

    // `both` scrolls on both axes: a wheel event moves the viewport along each.
    const target = Array.from(area('both').querySelectorAll('*')).find(
      (el) => el.scrollWidth > el.clientWidth + 1 && el.scrollHeight > el.clientHeight + 1
    )
    if (!target) throw new Error('No viewport that scrolls on both axes')
    target.dispatchEvent(new WheelEvent('wheel', { deltaX: 40, deltaY: 40, bubbles: true }))
    // A synthetic wheel event does not scroll by itself: set the offsets the browser would.
    target.scrollLeft = 40
    target.scrollTop = 40
    await expect(target.scrollLeft).toBeGreaterThan(0)
    await expect(target.scrollTop).toBeGreaterThan(0)
  }
}

const displays = ['hover', 'scroll', 'visible', 'hidden'] as const

/** When the bar shows: while hovering or scrolling (default), only while scrolling, always, or never. */
export const Displays: Story = {
  render: () => (
    <Axis axis='display' rows={displays}>
      {(display) => (
        <ScrollArea style={styles.box} scrollbarDisplay={display}>
          <div {...stylex.props(styles.inner)}>
            {tags.slice(0, 12).map((tag) => (
              <div key={tag} {...stylex.props(styles.tag)}>
                {tag}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const opacity = (display: string) => {
      const bar = cellOf(canvasElement, 'display', display).querySelector('[data-orientation]')
      if (!bar) throw new Error(`No scrollbar for ${display}`)
      return getComputedStyle(bar).opacity
    }
    // At rest, with no pointer over it and no scrolling: only `visible` shows the bar.
    await expect(opacity('visible')).toBe('1')
    await expect(opacity('hidden')).toBe('0')
    await expect(opacity('hover')).toBe('0')
    await expect(opacity('scroll')).toBe('0')
  }
}
