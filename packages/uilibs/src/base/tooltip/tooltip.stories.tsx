import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { cellOf, expectDisabledLook } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { fixedColors } from '../../styles/colors.stylex'
import { Button } from '../button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.component'

const meta = {
  title: 'Base Components/Tooltip',
  component: TooltipProvider
} satisfies Meta<typeof TooltipProvider>

type Story = StoryObj<typeof meta>

const sides = ['top', 'right', 'bottom', 'left'] as const

const styles = stylex.create({
  blackSurface: {
    backgroundColor: fixedColors.black,
    color: fixedColors.white,
    height: 1,
    width: 1
  },
  // Disabled native buttons don't fire pointer events, so the tooltip
  // trigger has to be the wrapping span instead of the button itself.
  trigger: {
    display: 'inline-block'
  }
})

export default meta

// The text, color, and placement belong to `TooltipContent`; the delay to the provider.
type PlaygroundArgs = ComponentProps<typeof TooltipProvider> &
  Pick<
    ComponentProps<typeof TooltipContent>,
    'color' | 'side' | 'sideOffset' | 'align' | 'alignOffset'
  > & { label: string }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['label', 'delay', 'color', 'side', 'sideOffset', 'align', 'alignOffset']
    },
    docs: {
      source: {
        code: `<TooltipProvider delay={0}>
  <Tooltip>
    <TooltipTrigger render={<Button variant='outline' />}>Lumos</TooltipTrigger>
    <TooltipContent color='neutral' side='top' align='center'>
      Add to the Restricted Section
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`
      }
    }
  },
  argTypes: {
    label: { control: 'text' },
    delay: { control: 'number' },
    color: { control: 'radio', options: ['neutral', 'inverted', 'dark'] },
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' }
  },
  args: {
    label: 'Add to the Restricted Section',
    delay: 0,
    color: 'neutral',
    side: 'top',
    sideOffset: 4,
    align: 'center',
    alignOffset: 0
  },
  render: ({ label, color, side, sideOffset, align, alignOffset, ...args }) => (
    <TooltipProvider {...args}>
      <Tooltip>
        <TooltipTrigger render={<Button variant='outline' />}>Lumos</TooltipTrigger>
        <TooltipContent
          color={color}
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Lumos' })

    // Hovering opens the tooltip (delay is 0 in this story).
    await userEvent.hover(trigger)
    await waitFor(() => expect(screen.getByText('Add to the Restricted Section')).toBeVisible())

    // Hovering away dismisses it.
    await userEvent.unhover(trigger)
    await waitFor(() => expect(screen.queryByText('Add to the Restricted Section')).toBeNull())
  }
}

// The a11y gate runs after `play`, when Playground's tooltip is closed again: this story keeps the
// popup, its surface, and its arrow open so the gate checks them.
export const Open: Story = {
  args: { delay: 0 },
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant='outline' />}>Nox</TooltipTrigger>
        <TooltipContent>Extinguish the wand light</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async () => {
    await waitFor(() => expect(screen.getByText('Extinguish the wand light')).toBeVisible())
  }
}

/** Each side opens its own tooltip; the popup flips when the canvas leaves it no room, so the side is not asserted. */
export const Sides: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant='outline' />}>left</TooltipTrigger>
    <TooltipContent side='left'>Reveals the left of the map</TooltipContent>
  </Tooltip>
</TooltipProvider>`
      }
    }
  },
  render: () => (
    <TooltipProvider>
      <Axis axis='side' rows={sides}>
        {(side) => (
          <Tooltip>
            <TooltipTrigger render={<Button variant='outline' />}>{side}</TooltipTrigger>
            <TooltipContent side={side}>Reveals the {side} of the map</TooltipContent>
          </Tooltip>
        )}
      </Axis>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    for (const side of sides) {
      const trigger = within(cellOf(canvasElement, 'side', side)).getByRole('button', {
        name: side
      })
      await userEvent.hover(trigger)
      await waitFor(() => expect(screen.getByText(`Reveals the ${side} of the map`)).toBeVisible())
      await userEvent.unhover(trigger)
      await waitFor(() => expect(screen.queryByText(`Reveals the ${side} of the map`)).toBeNull())
    }
  }
}

// Disabled native buttons don't fire pointer events, so the trigger is the wrapping span.
export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<span />}>
      <Button variant='outline' disabled>Alohomora</Button>
    </TooltipTrigger>
    <TooltipContent>Speak the riddle to unlock the disabled door</TooltipContent>
  </Tooltip>
</TooltipProvider>`
      }
    }
  },
  render: () => (
    <TooltipProvider>
      <Axis axis='state' rows={['default', 'disabled'] as const}>
        {(state) => (
          <Tooltip>
            <TooltipTrigger render={<span {...stylex.props(styles.trigger)} />}>
              <Button variant='outline' disabled={state === 'disabled'}>
                Alohomora
              </Button>
            </TooltipTrigger>
            <TooltipContent>Speak the riddle to unlock the {state} door</TooltipContent>
          </Tooltip>
        )}
      </Axis>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const disabled = cellOf(canvasElement, 'state', 'disabled')
    const button = within(disabled).getByRole('button', { name: 'Alohomora' })
    await expect(button).toBeDisabled()
    await expectDisabledLook(button, { text: true, edge: true })
    // The wrapper still opens the tooltip for the disabled button.
    const wrapper = disabled.firstElementChild
    if (!wrapper) throw new Error('No tooltip trigger for the disabled state')
    await userEvent.hover(wrapper)
    await waitFor(() =>
      expect(screen.getByText('Speak the riddle to unlock the disabled door')).toBeVisible()
    )
    await userEvent.unhover(wrapper)
  }
}

const colorNames = ['neutral', 'inverted', 'dark'] as const

/**
 * Every surface, each in its own provider and open, so the a11y gate checks the contrast of all
 * three. The probe is the constant black: `dark` is the same black in both themes.
 */
export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TooltipProvider>
  <Tooltip defaultOpen>
    <TooltipTrigger render={<Button variant='outline' />}>dark</TooltipTrigger>
    <TooltipContent color='dark' side='right'>Tooltip dark</TooltipContent>
  </Tooltip>
</TooltipProvider>`
      }
    }
  },
  render: () => (
    <div>
      <Axis axis='color' rows={colorNames}>
        {(color) => (
          <TooltipProvider>
            <Tooltip defaultOpen>
              <TooltipTrigger render={<Button variant='outline' />}>{color}</TooltipTrigger>
              <TooltipContent color={color} side='right'>{`Tooltip ${color}`}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Axis>
      <div data-testid='black-surface' {...stylex.props(styles.blackSurface)} />
    </div>
  ),
  play: async ({ canvas }) => {
    const black = getComputedStyle(canvas.getByTestId('black-surface'))
    const surfaces = new Map<string, CSSStyleDeclaration>()
    for (const color of colorNames) {
      surfaces.set(color, getComputedStyle(await screen.findByText(`Tooltip ${color}`)))
    }
    const look = (color: string) => {
      const style = surfaces.get(color)
      if (!style) throw new Error(`No tooltip for ${color}`)
      return `${style.backgroundColor}|${style.color}`
    }
    // Three colors, three looks; `dark` is black with white text, whatever the theme.
    await expect(new Set(colorNames.map(look)).size).toBe(colorNames.length)
    await expect(look('dark')).toBe(`${black.backgroundColor}|${black.color}`)
  }
}

const tip = () => screen.queryByText('Light the wand tip')

/** Focusing the trigger opens the tooltip, Escape closes it, and blurring the trigger closes it too. */
export const Keyboard: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant='outline' />}>Lumos</TooltipTrigger>
        <TooltipContent>Light the wand tip</TooltipContent>
      </Tooltip>
      <Button variant='outline'>Nox</Button>
    </TooltipProvider>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Lumos' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(tip()).toBeVisible())

    // Escape closes it while focus stays on the trigger.
    await pressUntil('{Escape}', () => expect(tip()).toBeNull())
    await expect(trigger).toHaveFocus()

    // Leaving the trigger and returning opens it again; moving on closes it.
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Nox' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(tip()).toBeVisible())
    await userEvent.tab()
    await waitFor(() => expect(tip()).toBeNull())
  }
}
