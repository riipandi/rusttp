import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { cellOf, expectTypeRole } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { type } from '../../styles/type.stylex'
import { Text } from './text.component'
import {
  textAlignStyles,
  textColorStyles,
  textVariantStyles,
  textWeightStyles
} from './text.stylex'

const meta = {
  title: 'Extra Components/Text',
  component: Text,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Text>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  clamp: {
    width: 240
  }
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
        'weight',
        'align',
        'decoration',
        'wrap',
        'maxLines',
        'monospace',
        'numeric'
      ]
    }
  },
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'select', options: Object.keys(textVariantStyles) },
    color: { control: 'select', options: Object.keys(textColorStyles) },
    weight: { control: 'select', options: Object.keys(textWeightStyles) },
    align: { control: 'inline-radio', options: Object.keys(textAlignStyles) },
    decoration: { control: 'select', options: ['underline', 'line-through'] },
    wrap: { control: 'select', options: ['balance', 'nowrap'] },
    maxLines: { control: 'number' },
    monospace: { control: 'boolean' },
    numeric: { control: 'boolean' }
  },
  args: {
    variant: 'body-1',
    children: 'Professor Langdon deciphered the cryptex beneath the Louvre',
    monospace: false,
    numeric: false
  },
  render: (args) => <Text {...args} />
}

const variantNames = [
  'headline-1',
  'headline-2',
  'headline-3',
  'featured-1',
  'featured-2',
  'featured-3',
  'featured-4',
  'featured-5',
  'featured-6',
  'body-1',
  'body-2',
  'caption-1',
  'caption-2'
] as const

// The `type` recipe each variant name maps to (`headline-1` is `type.headline1`).
const roleOf: Record<(typeof variantNames)[number], keyof typeof type> = {
  'headline-1': 'headline1',
  'headline-2': 'headline2',
  'headline-3': 'headline3',
  'featured-1': 'featured1',
  'featured-2': 'featured2',
  'featured-3': 'featured3',
  'featured-4': 'featured4',
  'featured-5': 'featured5',
  'featured-6': 'featured6',
  'body-1': 'body1',
  'body-2': 'body2',
  'caption-1': 'caption1',
  'caption-2': 'caption2'
}

export const Variants: Story = {
  parameters: { docs: { source: { code: `<Text variant='featured-3'>Lumos</Text>` } } },
  render: () => (
    <Axis axis='variant' rows={variantNames}>
      {(variant) => <Text variant={variant}>Lumos</Text>}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const size = (variant: string) =>
      parseFloat(
        getComputedStyle(
          cellOf(canvasElement, 'variant', variant).firstElementChild ?? canvasElement
        ).fontSize
      )
    // The scale runs from headlines down to captions.
    await expect(size('headline-1')).toBeGreaterThan(size('body-1'))
    await expect(size('body-1')).toBeGreaterThan(size('caption-2'))
    // Every variant draws the type role of its name, the one the component text parts compose.
    for (const variant of variantNames) {
      await expectTypeRole(
        cellOf(canvasElement, 'variant', variant).firstElementChild ?? canvasElement,
        roleOf[variant]
      )
    }
  }
}

const weightNames = ['regular', 'medium', 'semibold', 'bold', 'extrabold'] as const

export const Weights: Story = {
  render: () => (
    <Axis axis='weight' rows={weightNames}>
      {(weight) => <Text weight={weight}>{weight}</Text>}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const weights = weightNames.map(
      (weight) =>
        getComputedStyle(cellOf(canvasElement, 'weight', weight).firstElementChild ?? canvasElement)
          .fontWeight
    )
    await expect(new Set(weights).size).toBe(weightNames.length)
  }
}

const colorNames = [
  'neutral',
  'neutral-faded',
  'primary',
  'positive',
  'warning',
  'critical',
  'disabled'
] as const

export const Colors: Story = {
  parameters: { docs: { source: { code: `<Text color='critical'>critical</Text>` } } },
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => (
        <Text color={color} aria-disabled={color === 'disabled' ? true : undefined}>
          {color}
        </Text>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const tints = colorNames.map(
      (color) =>
        getComputedStyle(cellOf(canvasElement, 'color', color).firstElementChild ?? canvasElement)
          .color
    )
    await expect(new Set(tints).size).toBe(colorNames.length)
  }
}

/** A prop takes a per-breakpoint object as well as a single value. */
export const Responsive: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Text variant={{ small: 'body-2', medium: 'featured-4' }}>Responsive variant</Text>

<Text weight={{ small: 'regular', medium: 'bold' }}>Responsive weight</Text>

<Text variant={{ small: 'caption-1', medium: 'body-1', large: 'featured-5', xlarge: 'body-1' }}>
  Steps up at each breakpoint, then back down
</Text>`
      }
    }
  },
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Text variant={{ small: 'body-2', medium: 'featured-4' }}>Responsive variant</Text>
      <Text weight={{ small: 'regular', medium: 'bold' }}>Responsive weight</Text>
      <Text align={{ small: 'center', medium: 'start' }}>Responsive alignment</Text>
      <Text
        variant={{ small: 'caption-1', medium: 'body-1', large: 'featured-5', xlarge: 'body-1' }}
      >
        Steps up at each breakpoint, then back down
      </Text>
    </div>
  )
}

export const Decoration: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Text decoration='underline'>Underline</Text>
      <Text decoration='line-through'>Line through</Text>
    </div>
  )
}

export const Wrap: Story = {
  render: () => (
    <Text wrap='balance' variant='featured-3'>
      The manuscript every symbologist wants to decipher
    </Text>
  )
}

export const Monospace: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Text monospace>Fib: 1 1 2 3 5 8</Text>
      <Text monospace variant='featured-1' weight='regular'>
        CERN 1998
      </Text>
    </div>
  )
}

export const MaxLines: Story = {
  render: () => (
    <div {...stylex.props(styles.clamp)}>
      <Text maxLines={2}>
        The Marauder's Map revealed many variations of hidden passages, but the majority have
        suffered alteration in some form, by mischievous enchantments, or randomised footprints
        which don't look even slightly believable. If you are going to trace a passage of the Map,
        you need to be sure there isn't anything embarrassing hidden in the middle of the parchment.
      </Text>
    </div>
  )
}

export const Numeric: Story = {
  render: () => <Text numeric>1234567890</Text>
}

export const Align: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Text align='start'>Expelliarmus</Text>
      <Text align='center'>Expelliarmus</Text>
      <Text align='end'>Expelliarmus</Text>
    </div>
  )
}

export const Render: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Text render={<h1 />}>The Da Vinci Code</Text>

<Text variant='featured-2'>Chapter 1: The Louvre</Text>`
      }
    }
  },
  name: 'as',
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Text render={<h1 />}>The Da Vinci Code</Text>
      <Text variant='featured-2'>Chapter 1: The Louvre</Text>
      <Text variant={{ small: 'featured-2', medium: 'featured-3' }}>Chapter 2: The Vatican</Text>
    </div>
  ),
  play: async ({ canvas }) => {
    const els = canvas.getAllByRole('heading')

    await expect(els[0]?.tagName).toEqual('H1')
    await expect(els[1]?.tagName).toBe('H2')
    await expect(els[2]?.tagName).toBe('H3')
  }
}
