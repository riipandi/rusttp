import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, radius, unit } from '../../styles/tokens.stylex'
import { type } from '../../styles/type.stylex'
import { Carousel } from './carousel.component'

const meta = {
  title: 'Extra Components/Carousel',
  component: Carousel,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Carousel>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  slide: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.large,
    boxSizing: 'border-box',
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x1,
    justifyContent: 'flex-end',
    minHeight: unit.x20,
    overflowWrap: 'anywhere',
    padding: unit.x4
  },
  title: { margin: 0 },
  text: { color: colors.foregroundNeutralFaded, margin: 0 },
  stack: { display: 'flex', flexDirection: 'column', gap: unit.x4 },
  readout: { color: colors.foregroundNeutralFaded, margin: 0 }
})

export default meta

const spells = [
  ['Expelliarmus', 'Disarms an opponent.'],
  ['Lumos', 'Lights the tip of the wand.'],
  ['Accio', 'Summons a faraway object.'],
  ['Alohomora', 'Unlocks a door.'],
  ['Protego', 'Shields against a hex.'],
  ['Expecto Patronum', 'Conjures a Patronus.']
] as const

function Slide({ name, effect }: { name: string; effect: string }) {
  return (
    <div {...stylex.props(styles.slide)}>
      <h3 {...stylex.props(type.body1, styles.title)}>{name}</h3>
      <p {...stylex.props(type.body2, styles.text)}>{effect}</p>
    </div>
  )
}

const slides = spells.map(([name, effect]) => <Slide key={name} name={name} effect={effect} />)

/** The index of the first visible slide, read from the polite status text ("Slide 2 of 6"). */
const statusOf = (canvas: ReturnType<typeof within>) => canvas.getByRole('status').textContent

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['visibleItems', 'gap', 'showControls'] } },
  argTypes: {
    visibleItems: { control: { type: 'number', min: 1, max: 4 } },
    gap: { control: 'number' },
    showControls: { control: 'boolean' }
  },
  args: { visibleItems: 1, gap: 3, showControls: true },
  render: (args) => (
    <Carousel {...args} aria-label='Spells'>
      {slides}
    </Carousel>
  ),
  // The pattern: a named carousel region whose slides are groups named by their position.
  play: async ({ canvas }) => {
    const carousel = canvas.getByRole('region', { name: 'Spells' })
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
    const groups = within(carousel).getAllByRole('group', { name: /^\d of 6$/ })
    await expect(groups).toHaveLength(6)
    await expect(groups[0]).toHaveAttribute('aria-roledescription', 'slide')
    await expect(groups[0]).toHaveAccessibleName('1 of 6')
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    await expect(statusOf(canvas)).toBe('Slide 1 of 6')
  }
}

export const Visible: Story = {
  render: () => (
    <Axis axis='items' rows={['1', '2', '3'] as const} wide>
      {(count) => (
        <Carousel visibleItems={Number(count)} gap={4} aria-label={`${count} visible`}>
          {slides}
        </Carousel>
      )}
    </Axis>
  ),
  // Each slide is `1 / visibleItems` of the strip less the gaps, so a row of N fills it exactly.
  play: async ({ canvasElement }) => {
    for (const count of [1, 2, 3]) {
      const strip = cellOf(canvasElement, 'items', String(count)).querySelector(
        '[role=group][tabindex]'
      )
      const first = strip?.firstElementChild
      if (!strip || !first) throw new Error(`No strip for ${count}`)
      const expected = (strip.clientWidth - 16 * (count - 1)) / count
      await expect(first.getBoundingClientRect().width).toBeCloseTo(expected, 0)
    }
  }
}

export const Buttons: Story = {
  render: () => <Carousel aria-label='Spells with buttons'>{slides}</Carousel>,
  play: async ({ canvas }) => {
    const next = canvas.getByRole('button', { name: 'Next slide' })
    const previous = canvas.getByRole('button', { name: 'Previous slide' })
    await userEvent.click(next)
    await waitFor(() => expect(statusOf(canvas)).toBe('Slide 2 of 6'))
    await expect(previous).toHaveAttribute('aria-disabled', 'false')
    await userEvent.click(previous)
    // The status rounds to the nearer slide mid-scroll; the button disables once the strip rests.
    await waitFor(() => expect(previous).toHaveAttribute('aria-disabled', 'true'))
    await expect(statusOf(canvas)).toBe('Slide 1 of 6')
  }
}

export const Keyboard: Story = {
  render: () => <Carousel aria-label='Spells by keyboard'>{slides}</Carousel>,
  // Tab reaches the strip, then Previous and Next; the arrow keys, Home, and End move the strip. A press is
  // sent once the strip has focus, and the idempotent keys repeat inside `waitFor` (WebKit can
  // drop the first key after a focus change).
  play: async ({ canvas }) => {
    const strip = canvas.getByRole('group', { name: 'Slides' })
    strip.focus()
    await waitFor(() => expect(strip).toHaveFocus())
    await expect(strip).toHaveAttribute('tabindex', '0')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(statusOf(canvas)).toBe('Slide 2 of 6'))
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(statusOf(canvas)).toBe('Slide 1 of 6'))
    await waitFor(async () => {
      await userEvent.keyboard('{End}')
      await expect(statusOf(canvas)).toBe('Slide 6 of 6')
    })
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Next slide' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    )
    await waitFor(async () => {
      await userEvent.keyboard('{Home}')
      await expect(statusOf(canvas)).toBe('Slide 1 of 6')
    })
  }
}

export const EndOfStrip: Story = {
  render: () => <Carousel aria-label='Spells to the end'>{slides.slice(0, 2)}</Carousel>,
  // A disabled-at-the-end button stays in the tab order, so pressing Next on the last slide never
  // drops focus to the page.
  play: async ({ canvas }) => {
    const next = canvas.getByRole('button', { name: 'Next slide' })
    next.focus()
    await waitFor(() => expect(next).toHaveFocus())
    await userEvent.click(next)
    await waitFor(() => expect(next).toHaveAttribute('aria-disabled', 'true'))
    await expect(next).toHaveFocus()
    await expect(statusOf(canvas)).toBe('Slide 2 of 2')
  }
}

export const InteractiveSlides: Story = {
  render: () => (
    <Carousel aria-label='Spells to cast'>
      {spells.map(([name]) => (
        <div key={name} {...stylex.props(styles.slide)}>
          <h3 {...stylex.props(type.body1, styles.title)}>{name}</h3>
          <Button size='small' variant='outline'>
            Cast {name}
          </Button>
        </div>
      ))}
    </Carousel>
  ),
  // The strip's own keys apply only while the strip has focus; a control inside a slide keeps its
  // keys, and tabbing to one in a slide that is out of view scrolls that slide in.
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: 'Cast Expelliarmus' })
    first.focus()
    await waitFor(() => expect(first).toHaveFocus())
    await userEvent.keyboard('{ArrowRight}')
    await expect(statusOf(canvas)).toBe('Slide 1 of 6')
    const last = canvas.getByRole('button', { name: 'Cast Expecto Patronum' })
    last.focus()
    await waitFor(() => expect(statusOf(canvas)).toBe('Slide 6 of 6'))
  }
}

export const OnChange: Story = {
  render: () => {
    const [index, setIndex] = React.useState(0)
    return (
      <div {...stylex.props(styles.stack)}>
        <Carousel aria-label='Spells with a readout' visibleItems={2} onChange={setIndex}>
          {slides}
        </Carousel>
        <p {...stylex.props(type.body2, styles.readout)}>
          First visible: <output>{spells[index]?.[0]}</output>
        </p>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(canvas.getByText('Accio')).toBeInTheDocument())
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['controls', 'no-controls'] as const} wide>
      {(state) => (
        <Carousel aria-label={`State ${state}`} showControls={state === 'controls'}>
          {slides}
        </Carousel>
      )}
    </Axis>
  ),
  // Without controls the strip still scrolls, snaps, and takes the keys.
  play: async ({ canvasElement }) => {
    const buttons = (state: string) =>
      cellOf(canvasElement, 'state', state).querySelectorAll('button')
    await expect(buttons('controls')).toHaveLength(2)
    await expect(buttons('no-controls')).toHaveLength(0)
  }
}

export const RightToLeft: Story = {
  render: () => (
    <div dir='rtl'>
      <Carousel aria-label='Spells right to left'>{slides}</Carousel>
    </div>
  ),
  // The strip starts at the right: ArrowLeft goes forward and ArrowRight goes back, and Previous
  // sits to the right of Next.
  play: async ({ canvas }) => {
    const strip = canvas.getByRole('group', { name: 'Slides' })
    strip.focus()
    await waitFor(() => expect(strip).toHaveFocus())
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(statusOf(canvas)).toBe('Slide 2 of 6'))
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(statusOf(canvas)).toBe('Slide 1 of 6'))
    const previous = canvas.getByRole('button', { name: 'Previous slide' })
    const next = canvas.getByRole('button', { name: 'Next slide' })
    await expect(previous.getBoundingClientRect().left).toBeGreaterThan(
      next.getBoundingClientRect().left
    )
  }
}

export const ReducedMotion: Story = {
  render: () => <Carousel aria-label='Spells without motion'>{slides}</Carousel>,
  // Programmatic scrolling is smooth unless the user asks for reduced motion. The query is read at
  // press time, so the play answers it both ways and records what the strip is asked to do.
  play: async ({ canvas }) => {
    const strip = canvas.getByRole('group', { name: 'Slides' })
    const scrollTo = spyOn(strip, 'scrollTo')
    const original = window.matchMedia.bind(window)
    const matchMedia = spyOn(window, 'matchMedia')
    try {
      for (const reduce of [false, true]) {
        matchMedia.mockImplementation((query) => {
          const list = original(query)
          if (query.includes('prefers-reduced-motion')) {
            Object.defineProperty(list, 'matches', { value: reduce })
          }
          return list
        })
        scrollTo.mockClear()
        await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
        await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1))
        await expect(scrollTo.mock.calls[0]?.[0]).toMatchObject({
          behavior: reduce ? 'auto' : 'smooth'
        })
        await userEvent.click(canvas.getByRole('button', { name: 'Previous slide' }))
        await waitFor(() => expect(statusOf(canvas)).toBe('Slide 1 of 6'))
      }
    } finally {
      matchMedia.mockRestore()
      scrollTo.mockRestore()
    }
  }
}

export const Labels: Story = {
  render: () => (
    <Carousel
      aria-label='Sorts'
      labels={{
        roleDescription: 'carrousel',
        slideRoleDescription: 'diapositive',
        slides: 'Diapositives',
        slide: (index, total) => `${index} sur ${total}`,
        previous: 'Diapositive précédente',
        next: 'Diapositive suivante',
        status: (first, _last, total) => `Diapositive ${first} sur ${total}`
      }}
    >
      {slides}
    </Carousel>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Sorts' })).toHaveAttribute(
      'aria-roledescription',
      'carrousel'
    )
    await expect(canvas.getByRole('button', { name: 'Diapositive suivante' })).toBeInTheDocument()
    await expect(statusOf(canvas)).toBe('Diapositive 1 sur 6')
  }
}
