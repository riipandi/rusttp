import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button'
import { Input } from '../../base/input'
import { cellOf, expectTypeRole } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, stroke, zIndex } from '../../styles/tokens.stylex'
import { Link } from '../link'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './card.component'
import { cardSizes } from './card.stylex'

const meta = {
  title: 'Extra Components/Card',
  component: Card
} satisfies Meta<typeof Card>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  card: {
    maxWidth: '100%',
    width: container.xlarge
  },
  // The link's box is the whole card, so the card, not the link, shows the focus ring.
  linked: {
    outline: {
      default: 'none',
      ':has(a:focus-visible)': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    position: 'relative'
  },
  stretch: {
    outline: 'none',
    '::after': { content: '""', inset: 0, position: 'absolute' }
  },
  // A control inside a stretched card sits above the link's cover, so it still takes its own press.
  above: { position: 'relative', zIndex: zIndex.raised }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'selected', 'raised'] } },
  argTypes: {
    size: { control: 'radio', options: Object.keys(cardSizes) },
    selected: { control: 'boolean' },
    raised: { control: 'boolean' }
  },
  args: { size: 'medium', selected: false, raised: false },
  render: (args) => (
    <Card {...args} style={styles.card}>
      <CardHeader>
        <CardTitle>Submit to the Prophet</CardTitle>
        <CardDescription>Publish your story in the Daily Prophet with one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder='Headline' />
      </CardContent>
      <CardFooter>
        <Button>Publish</Button>
        <Button variant='ghost'>Discard</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Submit to the Prophet' })).toBeInTheDocument()
    await expectTypeRole(canvas.getByRole('heading', { name: 'Submit to the Prophet' }), 'body1')

    // The form inside the card accepts typing.
    const input = canvas.getByPlaceholderText('Headline')
    await userEvent.type(input, 'Snape Walks the Aisles')
    await expect(input).toHaveValue('Snape Walks the Aisles')
  }
}

export const Action: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card>
  <CardHeader>
    <CardTitle>Howlers</CardTitle>
    <CardDescription>You have 3 unread howlers.</CardDescription>
    <CardAction>
      <Button size='small' variant='ghost'>Burn all howlers</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>A red letter is smoking on the kitchen table.</p>
  </CardContent>
</Card>`
      }
    }
  },
  args: { size: 'medium' },
  render: (args) => (
    <Card {...args} style={styles.card}>
      <CardHeader>
        <CardTitle>Howlers</CardTitle>
        <CardDescription>You have 3 unread howlers.</CardDescription>
        <CardAction>
          <Button size='small' variant='ghost'>
            Burn all howlers
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>A red letter is smoking on the kitchen table.</p>
      </CardContent>
    </Card>
  )
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card size='small'>
  <CardHeader>
    <CardTitle>Chocolate Frog card</CardTitle>
    <CardDescription>Padding follows the card size.</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button size='small'>Collect</Button>
  </CardFooter>
</Card>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={['medium', 'small'] as const}>
      {(size) => (
        <Card size={size} style={styles.card}>
          <CardHeader>
            <CardTitle>Chocolate Frog card</CardTitle>
            <CardDescription>Padding follows the card size.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size='small'>Collect</Button>
          </CardFooter>
        </Card>
      )}
    </Axis>
  ),
  // `small` tightens the padding, so the same content is shorter.
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      (
        cellOf(canvasElement, 'size', size).firstElementChild ?? canvasElement
      ).getBoundingClientRect().height
    await expect(height('small')).toBeLessThan(height('medium'))
  }
}

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card raised>
  <CardContent>raised</CardContent>
</Card>

<Card selected>
  <CardContent>selected</CardContent>
</Card>`
      }
    }
  },
  render: () => (
    <Axis axis='state' rows={['default', 'raised', 'selected'] as const}>
      {(state) => (
        <Card
          raised={state === 'raised'}
          selected={state === 'selected'}
          data-testid={state}
          style={styles.card}
        >
          <CardContent>{state}</CardContent>
        </Card>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const style = (state: string) => getComputedStyle(canvas.getByTestId(state))
    await expect(style('raised').boxShadow).not.toBe(style('default').boxShadow)
    await expect(style('selected').borderTopColor).not.toBe(style('default').borderTopColor)
    // Selected also doubles the edge, so it is not told by color alone.
    await expect(style('selected').outlineWidth).toBe('1px')
    await expect(canvas.getByTestId('selected')).toHaveAttribute('data-selected')
  }
}

/** `render` swaps the `div` for another element; the card keeps its look and its `data-selected`. */
export const AsElement: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card render={<article />} selected>
  <CardHeader>
    <CardTitle>Marauder's Map</CardTitle>
  </CardHeader>
  <CardContent>Every corridor of Hogwarts, live on parchment.</CardContent>
</Card>`
      }
    }
  },
  name: 'As another element',
  render: () => (
    <Card render={<article />} selected style={styles.card}>
      <CardHeader>
        <CardTitle>Marauder's Map</CardTitle>
      </CardHeader>
      <CardContent>Every corridor of Hogwarts, live on parchment.</CardContent>
    </Card>
  ),
  play: async ({ canvas }) => {
    const article = canvas.getByRole('article')
    await expect(article.tagName).toBe('ARTICLE')
    await expect(article).toHaveAttribute('data-selected')
    await expect(getComputedStyle(article).outlineWidth).toBe('1px')
  }
}

/** What the browser finds at the centre of an element: the real hit target, cover included. */
function hit(element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect()
  return document.elementFromPoint(left + width / 2, top + height / 2)
}

const onSave = fn()

/** The title's link covers the whole card; a control inside keeps its own press by sitting above it. */
export const StretchedLink: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card style={…}>
  <CardHeader>
    <CardTitle>
      <Link href='#diagon-alley' color='inherit' variant='plain' style={…}>
        Diagon Alley
      </Link>
    </CardTitle>
    <CardDescription>Wands, cauldrons, and a bank run by goblins.</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button variant='outline' size='small' style={…}>Save for later</Button>
  </CardFooter>
</Card>`
      }
    }
  },
  name: 'Stretched link',
  render: () => (
    <Card style={[styles.card, styles.linked]}>
      <CardHeader>
        <CardTitle>
          <Link href='#diagon-alley' color='inherit' variant='plain' style={styles.stretch}>
            Diagon Alley
          </Link>
        </CardTitle>
        <CardDescription>Wands, cauldrons, and a bank run by goblins.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant='outline' size='small' style={styles.above} onClick={onSave}>
          Save for later
        </Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvas }) => {
    onSave.mockClear()
    const link = canvas.getByRole('link', { name: 'Diagon Alley' })
    const button = canvas.getByRole('button', { name: 'Save for later' })
    const description = canvas.getByText('Wands, cauldrons, and a bank run by goblins.')
    // `userEvent.click` dispatches on the element it is given and skips hit-testing, so the cover is
    // proved by what the browser finds at a point: the link under the description, and the button
    // above the cover.
    await expect(hit(description)).toBe(link)
    await expect(hit(button)).toBe(button)
    await userEvent.click(button)
    await expect(onSave).toHaveBeenCalledOnce()

    // The link's keyboard focus shows as the card's ring.
    const card = link.closest('h3')?.parentElement?.parentElement
    if (!card) throw new Error('No card')
    link.focus()
    await userEvent.tab({ shift: true })
    await userEvent.tab()
    await waitFor(() => expect(link).toHaveFocus())
    await waitFor(() => expect(getComputedStyle(card).outlineStyle).toBe('solid'))
  }
}
