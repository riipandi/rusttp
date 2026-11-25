import { ArrowRight, Plus } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import {
  cellOf,
  denseControlHeights,
  denseControlSizeNames,
  expectBoxSizes,
  expectControlHeights,
  expectDisabledLook,
  expectGlyphSizes
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { radius, unit } from '../../styles/tokens.stylex'
import { Button } from './button.component'
import { buttonFills, buttonSizes, buttonSquare } from './button.stylex'

const meta = {
  title: 'Base Components/Button',
  component: Button,
  tags: [], // ['autodocs']
  args: { onClick: fn() }
} satisfies Meta<typeof Button>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { width: 16, height: 16 },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: { borderRadius: radius.full },
  // `media` is for a photo or a dark surface, so its cells sit on black: the a11y gate then checks
  // white on black, which is what the color is for, not white on the page.
  backdrop: { backgroundColor: colors.black, borderRadius: radius.medium, padding: unit.x2 },
  // `inherit` takes the parent's text color; a parent with its own color shows that it does.
  parent: { color: colors.foregroundPrimary },
  wide: { paddingInline: 48 },
  paragraph: { margin: 0, marginBlockEnd: unit.x1 },
  // `medium` pads each side by `unit.x4`, so the margin is its negative.
  aligned: { marginInlineStart: `calc(-1 * ${unit.x4})` },
  wideBox: { width: 320 }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'children',
        'variant',
        'color',
        'size',
        'rounded',
        'fullWidth',
        'raised',
        'highlighted',
        'loading',
        'disabled'
      ]
    }
  },
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'radio', options: Object.keys(buttonFills) },
    // Every fill has every color, so the solid map lists them all.
    color: { control: 'select', options: Object.keys(buttonFills.solid) },
    size: { control: 'radio', options: Object.keys(buttonSizes) },
    rounded: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    raised: { control: 'boolean' },
    highlighted: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    variant: 'outline',
    children: 'New lecture',
    rounded: false,
    fullWidth: false,
    raised: false,
    highlighted: false,
    loading: false,
    disabled: false
  },
  render: ({ children, ...args }) => (
    <Button {...args}>
      <Plus {...stylex.props(styles.icon)} />
      {children}
    </Button>
  )
}

const fillNames = ['solid', 'faded', 'outline', 'ghost'] as const
const roleNames = ['primary', 'neutral', 'critical', 'positive', 'warning'] as const
const colorNames = [...roleNames, 'media', 'inherit'] as const

/** The four fills at the default color. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant='solid'>Expelliarmus</Button>
<Button variant='faded'>Expelliarmus</Button>
<Button variant='outline'>Expelliarmus</Button>
<Button variant='ghost'>Expelliarmus</Button>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={fillNames}>
      {(variant) => <Button variant={variant}>Expelliarmus</Button>}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const look = (variant: string) => {
      const el = canvasElement.querySelector(`[data-variant="${variant}"]`)?.firstElementChild
      if (!el) throw new Error(`No button for ${variant}`)
      const style = getComputedStyle(el)
      return `${style.backgroundColor}|${style.color}|${style.borderTopColor}|${style.borderTopWidth}`
    }
    // Every fill renders and none looks like another.
    await expect(new Set(fillNames.map(look)).size).toBe(fillNames.length)
  }
}

/**
 * Every fill in every color; the a11y gate checks the contrast of each pair. `media` sits on a
 * black backdrop and `inherit` in a parent with its own text color.
 */
export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant='solid' color='primary'>Obliviate</Button>
<Button variant='solid' color='critical'>Obliviate</Button>
<Button variant='outline' color='positive'>Obliviate</Button>
<Button variant='faded' color='media'>Obliviate</Button>
<Button variant='ghost' color='inherit'>Obliviate</Button>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={fillNames} columnAxis='color' columns={colorNames}>
      {(variant, color) => {
        const button = (
          <Button variant={variant} color={color}>
            Obliviate
          </Button>
        )
        if (color === 'media') return <div {...stylex.props(styles.backdrop)}>{button}</div>
        if (color === 'inherit') return <div {...stylex.props(styles.parent)}>{button}</div>
        return button
      }}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const buttonOf = (variant: string, color: string) => {
      const el = canvasElement
        .querySelector(`[data-variant="${variant}"][data-color="${color}"]`)
        ?.querySelector('button')
      if (!el) throw new Error(`No button for ${variant} ${color}`)
      return el
    }
    const look = (variant: string, color: string) => {
      const style = getComputedStyle(buttonOf(variant, color))
      return `${style.backgroundColor}|${style.color}|${style.borderTopColor}`
    }
    for (const variant of fillNames) {
      // Color and fill are independent: every role and `media` renders and no two share a look.
      await expect(new Set([...roleNames, 'media'].map((color) => look(variant, color))).size).toBe(
        roleNames.length + 1
      )
      // `inherit` takes the text color of its parent, not a role's.
      const parent = buttonOf(variant, 'inherit').parentElement
      if (!parent) throw new Error(`No parent for ${variant} inherit`)
      await expect(getComputedStyle(buttonOf(variant, 'inherit')).color).toBe(
        getComputedStyle(parent).color
      )
    }
  }
}

const sizeLabels = {
  xsmall: 'Fairy',
  small: 'House-elf',
  medium: 'Wizard',
  large: 'Giant'
} as const

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button size='xsmall' variant='outline' icon={Plus}>Fairy</Button>
<Button size='small' variant='outline' icon={Plus}>House-elf</Button>
<Button size='medium' variant='outline' icon={Plus}>Wizard</Button>
<Button size='large' variant='outline' icon={Plus}>Giant</Button>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Button size={size} variant='outline' icon={Plus}>
          {sizeLabels[size]}
        </Button>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    await expectControlHeights(canvasElement, denseControlHeights)
    await expectGlyphSizes(canvasElement, denseControlSizeNames)
  }
}

/**
 * A button with no children is a square as wide as it is tall, at every size; each needs an
 * `aria-label`. A button that holds a custom node, such as a page number, takes `buttonSquare`.
 */
export const IconSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `{/* No children: a square, named by aria-label */}
<Button size='medium' variant='outline' icon={Plus} aria-label='Accio medium' />

{/* A custom node: compose the square through style */}
<Button size='medium' variant='outline' style={buttonSquare.medium}>7</Button>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <div {...stylex.props(styles.row)}>
          <Button size={size} variant='outline' icon={Plus} aria-label={`Accio ${size}`} />
          <Button size={size} variant='outline' style={buttonSquare[size]}>
            7
          </Button>
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    await expectBoxSizes(canvasElement, 'button', {
      xsmall: [28, 28],
      small: [32, 32],
      medium: [36, 36],
      large: [40, 40]
    })
    for (const size of denseControlSizeNames) {
      const [iconOnly, numbered] = cellOf(canvasElement, 'size', size).querySelectorAll('button')
      await expect(numbered?.getBoundingClientRect().width).toBe(
        iconOnly?.getBoundingClientRect().width
      )
    }
    await expectGlyphSizes(canvasElement, denseControlSizeNames)
  }
}

/** Press states that are visible without interaction. */
export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant='faded'>Open the cryptex</Button>
<Button variant='faded' highlighted>Marauder’s Map</Button>
<Button variant='faded' disabled>Petrified</Button>
<Button variant='faded' loading>Apparating…</Button>`
      }
    }
  },
  render: (args) => (
    <Axis axis='state' rows={['default', 'highlighted', 'disabled', 'loading'] as const}>
      {(state) => (
        <Button
          variant='faded'
          onClick={args.onClick}
          highlighted={state === 'highlighted'}
          disabled={state === 'disabled'}
          loading={state === 'loading'}
        >
          {
            {
              default: 'Open the cryptex',
              highlighted: 'Marauder’s Map',
              disabled: 'Petrified',
              loading: 'Apparating…'
            }[state]
          }
        </Button>
      )}
    </Axis>
  ),
  play: async ({ args, canvas }) => {
    // Highlighted shows the hover fill at rest, so it differs from the default look.
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Marauder’s Map' })).backgroundColor
    ).not.toBe(
      getComputedStyle(canvas.getByRole('button', { name: 'Open the cryptex' })).backgroundColor
    )

    const petrified = canvas.getByRole('button', { name: 'Petrified' })
    await expect(petrified).toBeDisabled()
    // A disabled look is the disabled tokens (not opacity, which stacks) and a not-allowed cursor.
    await expectDisabledLook(petrified)
    await expect(getComputedStyle(petrified).color).not.toBe(
      getComputedStyle(canvas.getByRole('button', { name: 'Open the cryptex' })).color
    )

    // Loading is busy, not disabled: it keeps its name, stays focusable, and ignores presses.
    const apparating = canvas.getByRole('button', { name: 'Apparating…' })
    await expect(apparating).toHaveAttribute('aria-busy', 'true')
    apparating.focus()
    await expect(apparating).toHaveFocus()
    await userEvent.click(apparating)
    await expect(args.onClick).not.toHaveBeenCalled()
    // The spinner is hidden from assistive technology: one name, no second live region.
    await expect(canvas.queryByRole('status')).toBeNull()
  }
}

/** The label holds the width, so a button does not change size when it starts loading. */
export const LoadingKeepsWidth: Story = {
  name: 'Loading keeps its width',
  render: () => {
    const [loading, setLoading] = React.useState(false)
    return (
      <Button loading={loading} onClick={() => setLoading(true)}>
        Cast the spell
      </Button>
    )
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Cast the spell' })
    const width = button.getBoundingClientRect().width
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-busy', 'true')
    await expect(button.getBoundingClientRect().width).toBe(width)
  }
}

export const Rounded: Story = {
  render: () => <Button rounded>Golden Snitch</Button>,
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Golden Snitch' })).borderTopLeftRadius
    ).toBe('999px')
  }
}

export const Icons: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button icon={Plus}>Add a spell</Button>
      <Button endIcon={ArrowRight} variant='outline'>
        Next chapter
      </Button>
      <Button icon={Plus} aria-label='Accio' />
    </div>
  ),
  play: async ({ canvas }) => {
    // The glyphs are decoration: the names are the labels (and the aria-label when icon-only).
    await expect(canvas.getByRole('button', { name: 'Add a spell' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Next chapter' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Accio' })).toBeInTheDocument()
  }
}

export const FullWidth: Story = {
  name: 'Full width',
  render: () => (
    <div {...stylex.props(styles.wideBox)}>
      <Button fullWidth>Apparate to Hogsmeade</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Apparate to Hogsmeade' })
    await expect(button.getBoundingClientRect().width).toBe(
      button.parentElement?.getBoundingClientRect().width
    )
  }
}

export const Raised: Story = {
  render: () => <Button raised>Quidditch Cup</Button>,
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Quidditch Cup' })).boxShadow
    ).not.toBe('none')
  }
}

const onLinkClick = fn()
const onLinkRef = fn()

export const AsLink: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant='outline' render={<a href='#docs' />}>Read the Daily Prophet</Button>
<Button variant='ghost' size='small' aria-current='page' render={<a href='#overview' />}>Overview</Button>
<Button icon={ArrowRight} aria-label='Next page' render={<a href='#next' />} />`
      }
    }
  },
  name: 'as link',
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button
        variant='outline'
        ref={(node) => onLinkRef(node?.tagName)}
        onClick={(event) => {
          event.preventDefault()
          onLinkClick()
        }}
        render={<a href='#docs' />}
      >
        Read the Daily Prophet
      </Button>
      <Button variant='ghost' size='small' aria-current='page' render={<a href='#overview' />}>
        Overview
      </Button>
      <Button icon={ArrowRight} aria-label='Next page' render={<a href='#next' />} />
    </div>
  ),
  play: async ({ canvas }) => {
    // The element keeps its own role: an `a` with an `href` is a link with no `role` attribute,
    // and Base UI's `role="button"` is not added.
    const link = canvas.getByRole('link', { name: 'Read the Daily Prophet' })
    await expect(link).toHaveAttribute('href', '#docs')
    await expect(link).not.toHaveAttribute('role')
    await expect(canvas.queryByRole('button', { name: 'Read the Daily Prophet' })).toBeNull()

    // The button's handler and `ref` reach the anchor.
    await userEvent.click(link)
    await expect(onLinkClick).toHaveBeenCalledTimes(1)
    await expect(onLinkRef).toHaveBeenCalledWith('A')

    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )

    // Children make the button a rectangle; with none (an icon only) it is the square of its size.
    const wide = link.getBoundingClientRect()
    await expect(wide.width).toBeGreaterThan(wide.height)
    const square = canvas.getByRole('link', { name: 'Next page' }).getBoundingClientRect()
    await expect(square.width).toBe(square.height)
  }
}

const textLeft = (element: Element) => {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().left
}

// A ghost button's padding indents its label from the content edge; a negative margin of the same
// size lines the label up with the text above it (the recipe `button.mdx` documents).
export const Aligned: Story = {
  parameters: {
    docs: {
      source: {
        code: `<p>Cast the charm at the edge of the line.</p>
<Button variant='ghost' style={…}>Cancel</Button>`
      }
    }
  },
  render: () => (
    <div>
      <p {...stylex.props(styles.paragraph)}>Cast the charm at the edge of the line.</p>
      <Button variant='ghost' style={styles.aligned}>
        Cancel
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const paragraph = canvas.getByText('Cast the charm at the edge of the line.')
    const button = canvas.getByRole('button', { name: 'Cancel' })
    await expect(Math.round(textLeft(button))).toBe(Math.round(textLeft(paragraph)))
  }
}

export const StyleOverride: Story = {
  name: 'style override',
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Button style={styles.pill}>Time-Turner</Button>
      <Button variant='outline' style={[styles.pill, styles.wide]}>
        Time-Turner, extra wide
      </Button>
    </div>
  )
}

/** Tab reaches a button, Enter and Space press it, Tab skips a disabled one, and a loading one stays focusable but ignores both keys. */
export const Keyboard: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      <Button onClick={args.onClick}>Open the cryptex</Button>
      <Button disabled onClick={args.onClick}>
        Petrified
      </Button>
      <Button loading onClick={args.onClick}>
        Apparating…
      </Button>
    </div>
  ),
  play: async ({ args, canvas }) => {
    const open = canvas.getByRole('button', { name: 'Open the cryptex' })
    const petrified = canvas.getByRole('button', { name: 'Petrified' })
    const apparating = canvas.getByRole('button', { name: 'Apparating…' })

    await userEvent.tab()
    await expect(open).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(args.onClick).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(' ')
    await expect(args.onClick).toHaveBeenCalledTimes(2)

    // Tab skips the disabled button and lands on the loading one, which keeps its focus.
    await userEvent.tab()
    await expect(petrified).not.toHaveFocus()
    await expect(apparating).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  }
}

export const OnClick: StoryObj<{ handleClick: ReturnType<typeof fn> }> = {
  name: 'onClick',
  args: { handleClick: fn() },
  render: (args) => <Button onClick={args.handleClick}>Open the cryptex</Button>,
  play: async ({ canvas, args }) => {
    const { handleClick } = args
    const buttons = canvas.getAllByRole('button')
    const el = buttons[0]
    if (el) {
      await userEvent.click(el)
      await expect(el).toHaveAttribute('type', 'button')
      await expect(handleClick).toHaveBeenCalledTimes(1)
    }
  }
}
