import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { shadow } from '../../styles/colors.stylex'
import { fontSize, fontWeight, unit } from '../../styles/tokens.stylex'
import { Button } from '../button'
import { Field, FieldLabel } from '../field'
import { Input } from '../input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger
} from './popover.component'
import { popoverPadding, popoverRadii } from './popover.stylex'

const meta = {
  title: 'Base Components/Popover',
  component: Popover
} satisfies Meta<typeof Popover>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  // A row tall enough for the open popup to the right of its trigger, so open popups do not overlap.
  slot: { minHeight: 96 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  heading: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.semibold
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x3,
    marginTop: unit.x4
  }
})

export default meta

type PlaygroundArgs = ComponentProps<typeof Popover> &
  Pick<
    ComponentProps<typeof PopoverContent>,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'elevation' | 'padding' | 'borderRadius'
  >

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'side',
        'sideOffset',
        'align',
        'alignOffset',
        'elevation',
        'padding',
        'borderRadius',
        'modal'
      ]
    }
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' },
    modal: { control: 'radio', options: [false, true, 'trap-focus'] },
    elevation: { control: 'radio', options: ['outline', 'raised', 'overlay'] },
    padding: { control: 'select', options: Object.keys(popoverPadding).map(Number) },
    borderRadius: { control: 'radio', options: Object.keys(popoverRadii) }
  },
  args: {
    side: 'bottom',
    sideOffset: 4,
    align: 'center',
    alignOffset: 0,
    modal: false,
    elevation: 'raised',
    padding: 4,
    borderRadius: 'medium'
  },
  render: ({ side, sideOffset, align, alignOffset, elevation, padding, borderRadius, ...args }) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant='outline' />}>Summon popover</PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        elevation={elevation}
        padding={padding}
        borderRadius={borderRadius}
      >
        <div {...stylex.props(styles.form)}>
          <strong {...stylex.props(styles.heading)}>Cryptex settings</strong>
          <Input placeholder='First dial' defaultValue='100%' />
          <Input placeholder='Second dial' defaultValue='25px' />
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Summon popover' }))
    const popover = await screen.findByRole('dialog')
    await expect(within(popover).getByPlaceholderText('First dial')).toHaveValue('100%')

    // Clicking outside dismisses the popover.
    await userEvent.click(document.body)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

const sides = ['top', 'right', 'bottom', 'left'] as const

/** Each side opens its own popover; the popup flips when the canvas leaves it no room, so the side is not asserted. */
export const Placement: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Popover>
  <PopoverTrigger render={<Button variant='outline' />}>top</PopoverTrigger>
  <PopoverContent side='top' aria-label='Levitate top'>
    Wingardium Leviosa — hovering to the top of the trigger.
  </PopoverContent>
</Popover>`
      }
    }
  },
  render: () => (
    <Axis axis='side' rows={sides}>
      {(side) => (
        <Popover>
          <PopoverTrigger render={<Button variant='outline' />}>{side}</PopoverTrigger>
          <PopoverContent side={side} aria-label={`Levitate ${side}`}>
            Wingardium Leviosa — hovering to the {side} of the trigger.
          </PopoverContent>
        </Popover>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const side of sides) {
      await userEvent.click(
        within(cellOf(canvasElement, 'side', side)).getByRole('button', { name: side })
      )
      const popover = await screen.findByRole('dialog', { name: `Levitate ${side}` })
      await expect(popover).toHaveTextContent(`to the ${side} of the trigger`)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
  }
}

export const Parts: Story = {
  name: 'Header, title, description',
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant='outline' />}>Summon popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Cryptex settings</PopoverTitle>
          <PopoverDescription>Dial the letters to crack the vault seal.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

export const Form: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Popover>
  <PopoverTrigger render={<Button variant='outline' />}>Edit vault permit</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Edit vault permit</PopoverTitle>
      <PopoverDescription>Update the name engraved on your Gringotts key.</PopoverDescription>
    </PopoverHeader>
    <form>
      <Field>
        <FieldLabel htmlFor='name'>Account holder</FieldLabel>
        <Input id='name' defaultValue='Hermione Granger' />
      </Field>
      <Button type='submit' size='small'>Save permit</Button>
    </form>
  </PopoverContent>
</Popover>`
      }
    }
  },
  name: 'With form',
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant='outline' />}>Edit vault permit</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Edit vault permit</PopoverTitle>
          <PopoverDescription>Update the name engraved on your Gringotts key.</PopoverDescription>
        </PopoverHeader>
        <form {...stylex.props(styles.formCol)}>
          <Field>
            <FieldLabel htmlFor='popover-form-name'>Account holder</FieldLabel>
            <Input id='popover-form-name' defaultValue='Hermione Granger' />
          </Field>
          <Field>
            <FieldLabel htmlFor='popover-form-handle'>Handle</FieldLabel>
            <Input id='popover-form-handle' defaultValue='@brightestwitch' />
          </Field>
          <Button type='submit' size='small'>
            Save permit
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

const elevations = ['outline', 'raised', 'overlay'] as const

// Each probe is a plain box carrying one `shadow` token, so the play compares the popup with the token itself.
const probes = stylex.create({
  outline: { boxShadow: shadow.outline },
  raised: { boxShadow: shadow.raised },
  overlay: { boxShadow: shadow.overlay }
})

/** `elevation` names the `shadow` token the popup draws. All three stay open so the a11y gate sees them. */
export const Elevations: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Popover defaultOpen>
  <PopoverTrigger render={<Button variant='outline' />}>overlay</PopoverTrigger>
  <PopoverContent elevation='overlay' side='right' align='start' aria-label='overlay notice'>
    Elevation overlay
  </PopoverContent>
</Popover>`
      }
    }
  },
  render: () => (
    <div>
      {elevations.map((elevation) => (
        <div key={elevation} {...stylex.props(styles.slot)}>
          <div
            data-testid={`probe-${elevation}`}
            aria-hidden
            {...stylex.props(probes[elevation])}
          />
          <Popover defaultOpen>
            <PopoverTrigger render={<Button variant='outline' />}>{elevation}</PopoverTrigger>
            <PopoverContent
              elevation={elevation}
              side='right'
              align='start'
              aria-label={`${elevation} notice`}
            >
              {`Elevation ${elevation}`}
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const seen = new Set<string>()
    for (const elevation of elevations) {
      const token = getComputedStyle(await canvas.findByTestId(`probe-${elevation}`)).boxShadow
      const drawn = getComputedStyle(await screen.findByText(`Elevation ${elevation}`)).boxShadow
      // The popup layers its edge ring first and the token after it.
      await expect(drawn.endsWith(token)).toBe(true)
      seen.add(token)
    }
    await expect(seen.size).toBe(3)
  }
}

const steps = { '0': 0, '2': 2, '4': 4, '8': 8 } as const
const paddings = ['0', '2', '4', '8'] as const

const paddingOf = async (name: string) =>
  getComputedStyle(await screen.findByRole('dialog', { name: `Padding ${name}` })).paddingTop

/** Padding counts `unit` steps: `4` (16px) is the default, `0` leaves the content flush. All stay open for the a11y gate. */
export const Paddings: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Popover defaultOpen>
  <PopoverTrigger render={<Button variant='outline' />}>padding 8</PopoverTrigger>
  <PopoverContent side='right' align='start' padding={8} aria-label='Padding 8'>
    Padding 8
  </PopoverContent>
</Popover>`
      }
    }
  },
  render: () => (
    <Axis axis='padding' rows={paddings}>
      {(padding) => (
        <div {...stylex.props(styles.slot)}>
          <Popover defaultOpen>
            <PopoverTrigger
              render={<Button variant='outline' />}
            >{`padding ${padding}`}</PopoverTrigger>
            <PopoverContent
              side='right'
              align='start'
              padding={steps[padding]}
              aria-label={`Padding ${padding}`}
            >
              {`Padding ${padding}`}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Axis>
  ),
  play: async () => {
    // One step is 4px; the default is four steps.
    for (const name of paddings) await expect(await paddingOf(name)).toBe(`${steps[name] * 4}px`)
  }
}

const radii = ['medium', 'large'] as const

const cornerOf = async (radius: string) =>
  getComputedStyle(await screen.findByRole('dialog', { name: `Radius ${radius}` }))
    .borderTopLeftRadius

/** The corner radius of the popup; `medium` is the default. */
export const Radii: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Popover defaultOpen>
  <PopoverTrigger render={<Button variant='outline' />}>large</PopoverTrigger>
  <PopoverContent side='right' align='start' borderRadius='large' aria-label='Radius large'>
    Radius large
  </PopoverContent>
</Popover>`
      }
    }
  },
  render: () => (
    <Axis axis='radius' rows={radii}>
      {(radius) => (
        <div {...stylex.props(styles.slot)}>
          <Popover defaultOpen>
            <PopoverTrigger render={<Button variant='outline' />}>{radius}</PopoverTrigger>
            <PopoverContent
              side='right'
              align='start'
              borderRadius={radius}
              aria-label={`Radius ${radius}`}
            >
              {`Radius ${radius}`}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Axis>
  ),
  play: async () => {
    await expect(await cornerOf('medium')).toBe('8px')
    await expect(await cornerOf('large')).toBe('10px')
  }
}

function Cryptex({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger render={<Button variant='outline' />}>Open the cryptex</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Cryptex settings</PopoverTitle>
          <PopoverDescription>Dial the letters to crack the vault seal.</PopoverDescription>
        </PopoverHeader>
        <div {...stylex.props(styles.form)}>
          <Input aria-label='First dial' defaultValue='100%' />
          <Input aria-label='Second dial' defaultValue='25px' />
        </div>
      </PopoverContent>
    </Popover>
  )
}

// The a11y gate runs after `play`, when a popover a play opened has closed again: this story keeps
// the popup open so the gate checks it.
export const Open: Story = {
  render: () => <Cryptex defaultOpen />,
  play: async () => {
    const popover = await screen.findByRole('dialog', { name: 'Cryptex settings' })
    await waitFor(() => expect(popover).toBeVisible())
    await expect(popover).toHaveAccessibleDescription('Dial the letters to crack the vault seal.')
  }
}

const openedInKeyboard = () => screen.getByRole('dialog', { name: 'Cryptex settings' })

/** Enter or Space opens the popover from its trigger, Tab moves between its controls, and Escape closes it and returns focus. */
export const Keyboard: Story = {
  render: () => <Cryptex />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Open the cryptex' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    // Enter opens it only while it is closed: once open, focus is inside.
    await pressUntil('{Enter}', openedInKeyboard, { when: () => !screen.queryByRole('dialog') })

    // Focus moves to the first control, and Tab moves on to the next.
    const first = screen.getByRole('textbox', { name: 'First dial' })
    const second = screen.getByRole('textbox', { name: 'Second dial' })
    await waitFor(() => expect(first).toHaveFocus())
    await pressUntil('{Tab}', () => expect(second).toHaveFocus(), {
      when: () => document.activeElement === first
    })

    // Escape closes it and returns focus to the trigger.
    await pressUntil('{Escape}', () => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    // Space opens it too.
    await pressUntil(' ', openedInKeyboard, { when: () => !screen.queryByRole('dialog') })
    // The popup mounts again on each open, so its controls are read again.
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'First dial' })).toHaveFocus())
    await pressUntil('{Escape}', () => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
