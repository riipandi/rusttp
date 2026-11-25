import { AlignCenter, AlignLeft } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, userEvent } from 'storybook/test'
import {
  cellOf,
  denseControlHeights,
  denseControlSizeNames,
  expectControlHeights,
  expectDisabledLook
} from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { Button } from '../button'
import { toggleSizes } from '../toggle/toggle.stylex'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.component'

const meta = {
  title: 'Base Components/ToggleGroup',
  component: ToggleGroup,
  tags: [] // ['autodocs']
} satisfies Meta<typeof ToggleGroup>

type Story = StoryObj<typeof meta>

export default meta

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'variant',
        'selectedVariant',
        'selectedColor',
        'size',
        'spacing',
        'orientation',
        'multiple',
        'disabled'
      ]
    }
  },
  argTypes: {
    variant: { control: 'radio', options: ['ghost', 'outline', 'solid'] },
    selectedVariant: { control: 'radio', options: ['ghost', 'outline', 'solid'] },
    selectedColor: {
      control: 'radio',
      options: ['neutral', 'primary', 'critical', 'positive', 'warning']
    },
    size: { control: 'radio', options: Object.keys(toggleSizes) },
    spacing: { control: 'radio', options: ['gap', 'joined'] },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: {
    defaultValue: ['bold'],
    variant: 'ghost',
    selectedColor: 'neutral',
    size: 'medium',
    spacing: 'gap',
    orientation: 'horizontal',
    multiple: false,
    disabled: false
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value='bold' aria-label='Toggle charm'>
        Charm
      </ToggleGroupItem>
      <ToggleGroupItem value='italic' aria-label='Toggle hex'>
        Hex
      </ToggleGroupItem>
      <ToggleGroupItem value='underline' aria-label='Toggle jinx'>
        Jinx
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvas }) => {
    const charm = canvas.getByRole('button', { name: 'Toggle charm' })
    const hex = canvas.getByRole('button', { name: 'Toggle hex' })

    // defaultValue starts pressed.
    await expect(charm).toHaveAttribute('data-pressed')

    // Without `multiple`, selection is exclusive: pressing hex releases charm.
    await userEvent.click(hex)
    await expect(hex).toHaveAttribute('data-pressed')
    await expect(charm).not.toHaveAttribute('data-pressed')

    await userEvent.click(charm)
    await expect(charm).toHaveAttribute('data-pressed')
    await expect(hex).not.toHaveAttribute('data-pressed')
  }
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={denseControlSizeNames}>
      {(size) => (
        <ToggleGroup size={size} variant='outline' defaultValue={['bold']}>
          <ToggleGroupItem value='bold' aria-label={`Toggle charm ${size}`}>
            Charm
          </ToggleGroupItem>
          <ToggleGroupItem value='italic' aria-label={`Toggle hex ${size}`}>
            Hex
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => await expectControlHeights(canvasElement, denseControlHeights)
}

export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ToggleGroup variant='outline' selectedColor='primary' defaultValue={['left']}>
  <ToggleGroupItem value='left' aria-label='Left outline'>
    <AlignLeft size={16} />
  </ToggleGroupItem>
  <ToggleGroupItem value='center' aria-label='Center outline'>
    <AlignCenter size={16} />
  </ToggleGroupItem>
</ToggleGroup>`
      }
    }
  },
  render: () => (
    <Axis axis='variant' rows={['ghost', 'outline', 'solid'] as const}>
      {(variant) => (
        <ToggleGroup variant={variant} selectedColor='primary' defaultValue={['left']}>
          <ToggleGroupItem value='left' aria-label={`Left ${variant}`}>
            <AlignLeft size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value='center' aria-label={`Center ${variant}`}>
            <AlignCenter size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    for (const variant of ['ghost', 'outline', 'solid']) {
      const pressed = getComputedStyle(canvas.getByRole('button', { name: `Left ${variant}` }))
      const rest = getComputedStyle(canvas.getByRole('button', { name: `Center ${variant}` }))
      // `selectedColor` reaches the items through the group: the pressed one is colored.
      await expect(pressed.backgroundColor).not.toBe(rest.backgroundColor)
    }
  }
}

const colorNames = ['neutral', 'primary', 'critical', 'positive', 'warning'] as const

/** `selectedVariant` and `selectedColor` reach every item through the group; the a11y gate checks each pair. */
export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ToggleGroup selectedVariant='solid' selectedColor='critical' spacing='joined' defaultValue={['left']}>
  <ToggleGroupItem value='left' aria-label='Left solid critical'>
    <AlignLeft size={16} />
  </ToggleGroupItem>
  <ToggleGroupItem value='center' aria-label='Center solid critical'>
    <AlignCenter size={16} />
  </ToggleGroupItem>
</ToggleGroup>`
      }
    }
  },
  render: () => (
    <Axis
      axis='selected'
      rows={['ghost', 'outline', 'solid'] as const}
      columnAxis='color'
      columns={colorNames}
    >
      {(selected, color) => (
        <ToggleGroup
          selectedVariant={selected}
          selectedColor={color}
          spacing='joined'
          defaultValue={['left']}
        >
          <ToggleGroupItem value='left' aria-label={`Left ${selected} ${color}`}>
            <AlignLeft size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value='center' aria-label={`Center ${selected} ${color}`}>
            <AlignCenter size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const look = (selected: string, color: string) => {
      const style = getComputedStyle(
        canvas.getByRole('button', { name: `Left ${selected} ${color}` })
      )
      return `${style.backgroundColor}|${style.color}|${style.boxShadow}`
    }
    for (const selected of ['ghost', 'outline', 'solid']) {
      await expect(new Set(colorNames.map((color) => look(selected, color))).size).toBe(
        colorNames.length
      )
      // The item that is not pressed keeps its rest look in every color.
      const rest = getComputedStyle(
        canvas.getByRole('button', { name: `Center ${selected} primary` })
      )
      await expect(rest.boxShadow).toBe('none')
    }
  }
}

const items = (root: HTMLElement) => Array.from(root.querySelectorAll('button'))

export const Orientations: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ToggleGroup orientation='vertical' variant='outline' spacing='joined' defaultValue={['center']}>
  <ToggleGroupItem value='start' aria-label='Align start vertical'>Start</ToggleGroupItem>
  <ToggleGroupItem value='center' aria-label='Align center vertical'>Center</ToggleGroupItem>
  <ToggleGroupItem value='end' aria-label='Align end vertical'>End</ToggleGroupItem>
</ToggleGroup>`
      }
    }
  },
  render: () => (
    <Axis axis='orientation' rows={['horizontal', 'vertical'] as const}>
      {(orientation) => (
        <ToggleGroup
          orientation={orientation}
          variant='outline'
          spacing='joined'
          defaultValue={['center']}
        >
          <ToggleGroupItem value='start' aria-label={`Align start ${orientation}`}>
            Start
          </ToggleGroupItem>
          <ToggleGroupItem value='center' aria-label={`Align center ${orientation}`}>
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value='end' aria-label={`Align end ${orientation}`}>
            End
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const [h1, h2] = items(cellOf(canvasElement, 'orientation', 'horizontal')).map((el) =>
      el.getBoundingClientRect()
    )
    const [v1, v2] = items(cellOf(canvasElement, 'orientation', 'vertical')).map((el) =>
      el.getBoundingClientRect()
    )
    if (!h1 || !h2 || !v1 || !v2) throw new Error('Toggle group items not found')
    await expect(h2.left).toBeGreaterThan(h1.left)
    await expect(h2.top).toBe(h1.top)
    await expect(v2.top).toBeGreaterThan(v1.top)
    await expect(v2.left).toBe(v1.left)
  }
}

export const Spacings: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ToggleGroup spacing='joined' variant='outline' defaultValue={['left']}>
  <ToggleGroupItem value='left' aria-label='Left joined'>
    <AlignLeft size={16} />
  </ToggleGroupItem>
  <ToggleGroupItem value='center' aria-label='Center joined'>
    <AlignCenter size={16} />
  </ToggleGroupItem>
</ToggleGroup>`
      }
    }
  },
  render: () => (
    <Axis axis='spacing' rows={['gap', 'joined'] as const}>
      {(spacing) => (
        <ToggleGroup spacing={spacing} variant='outline' defaultValue={['left']}>
          <ToggleGroupItem value='left' aria-label={`Left ${spacing}`}>
            <AlignLeft size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value='center' aria-label={`Center ${spacing}`}>
            <AlignCenter size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const space = (spacing: string) => {
      const [first, second] = items(cellOf(canvasElement, 'spacing', spacing)).map((el) =>
        el.getBoundingClientRect()
      )
      if (!first || !second) throw new Error(`No items for ${spacing}`)
      return second.left - first.right
    }
    // `gap` leaves room between the items; `joined` fuses them edge to edge.
    await expect(space('gap')).toBeGreaterThan(0)
    await expect(space('joined')).toBeLessThanOrEqual(0)
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled'] as const}>
      {(state) => (
        <ToggleGroup variant='outline' disabled={state === 'disabled'} defaultValue={['bold']}>
          <ToggleGroupItem value='bold' aria-label={`Toggle charm ${state}`}>
            Charm
          </ToggleGroupItem>
          <ToggleGroupItem value='italic' aria-label={`Toggle hex ${state}`}>
            Hex
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const disabled = items(cellOf(canvasElement, 'state', 'disabled'))
    await expect(disabled).toHaveLength(2)
    for (const item of disabled) {
      await expect(item).toBeDisabled()
      await expectDisabledLook(item)
    }
    const [charm, hex] = disabled
    if (!charm || !hex) throw new Error('Disabled items not found')
    await userEvent.click(hex)
    await expect(hex).not.toHaveAttribute('data-pressed')
    await expect(charm).toHaveAttribute('data-pressed')
    for (const item of items(cellOf(canvasElement, 'state', 'default'))) {
      await expect(item).not.toBeDisabled()
    }
  }
}

/** Tab enters the group in one stop, the arrows move focus along it, and Space or Enter presses the focused item. */
export const Keyboard: Story = {
  args: { defaultValue: ['bold'], multiple: false },
  render: (args) => (
    <>
      <ToggleGroup {...args} variant='outline' aria-label='Charms'>
        <ToggleGroupItem value='bold'>Charm</ToggleGroupItem>
        <ToggleGroupItem value='italic'>Hex</ToggleGroupItem>
        <ToggleGroupItem value='underline'>Jinx</ToggleGroupItem>
      </ToggleGroup>
      <Button size='small'>Cast</Button>
    </>
  ),
  play: async ({ canvas }) => {
    const charm = canvas.getByRole('button', { name: 'Charm' })
    const hex = canvas.getByRole('button', { name: 'Hex' })
    const jinx = canvas.getByRole('button', { name: 'Jinx' })
    const after = canvas.getByRole('button', { name: 'Cast' })

    // The group is one tab stop, on the first item.
    await userEvent.tab()
    await expect(charm).toHaveFocus()
    await pressUntil('{ArrowRight}', () => expect(hex).toHaveFocus(), {
      when: () => document.activeElement === charm
    })
    // Moving focus does not press; Space does, and releases the item that was pressed.
    await expect(hex).not.toHaveAttribute('data-pressed')
    await userEvent.keyboard(' ')
    await expect(hex).toHaveAttribute('data-pressed')
    await expect(charm).not.toHaveAttribute('data-pressed')

    await pressUntil('{End}', () => expect(jinx).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(jinx).toHaveAttribute('data-pressed')
    await pressUntil('{Home}', () => expect(charm).toHaveFocus())

    // Tab leaves the group in one press.
    await userEvent.tab()
    await expect(after).toHaveFocus()
  }
}
