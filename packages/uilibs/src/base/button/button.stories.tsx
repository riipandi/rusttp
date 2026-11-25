import { ArrowRight, Plus } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import {
  denseControlHeights,
  denseControlSizeNames,
  expectBoxSizes,
  expectControlHeights,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { radius, unit } from '../../styles/tokens.stylex'
import { Button, LinkButton } from './button.component'
import { buttonFills, buttonSizes } from './button.stylex'

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
    // The icon-only sizes are square and have no room for a label; `IconSizes` shows them.
    size: {
      control: 'radio',
      options: Object.keys(buttonSizes).filter((size) => !size.startsWith('icon-'))
    },
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

const sizeLabels = { xs: 'Fairy', sm: 'House-elf', md: 'Wizard', lg: 'Giant' } as const

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <Button size={size} variant='outline'>
          {sizeLabels[size]}
        </Button>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => expectControlHeights(canvasElement, denseControlHeights)
}

const iconSizes = ['icon-xs', 'icon-sm', 'icon-md', 'icon-lg'] as const

/** The square icon-only sizes; each needs an `aria-label`. */
export const IconSizes: Story = {
  render: () => (
    <Axis axis='size' rows={iconSizes}>
      {(size) => (
        <Button size={size} variant='outline' aria-label={`Accio ${size}`}>
          <Plus {...stylex.props(styles.icon)} />
        </Button>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectBoxSizes(canvasElement, 'button', {
      'icon-xs': [28, 28],
      'icon-sm': [32, 32],
      'icon-md': [36, 36],
      'icon-lg': [40, 40]
    })
}

/** Press states that are visible without interaction. */
export const States: Story = {
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

export const AsLink: Story = {
  name: 'as link',
  render: () => (
    <LinkButton variant='outline' render={<a href='#docs' />}>
      Read the Daily Prophet
    </LinkButton>
  ),
  play: async ({ canvas }) => {
    // Base UI gives a non-native button role="button"; a link button is announced as a link.
    const link = canvas.getByRole('link', { name: 'Read the Daily Prophet' })
    await expect(link).toHaveAttribute('href', '#docs')
    await expect(canvas.queryByRole('button', { name: 'Read the Daily Prophet' })).toBeNull()
  }
}

export const CurrentLink: Story = {
  name: 'as current link',
  render: () => (
    <LinkButton variant='ghost' size='sm' current render={<a href='#overview' />}>
      Overview
    </LinkButton>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )
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
