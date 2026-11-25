import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
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
  component: Popover,
  tags: [] // ['autodocs']
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
    'side' | 'align' | 'elevation' | 'padding' | 'borderRadius'
  >

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['side', 'align', 'elevation', 'padding', 'borderRadius'] }
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    elevation: { control: 'radio', options: ['outline', 'raised', 'overlay'] },
    padding: { control: 'select', options: Object.keys(popoverPadding).map(Number) },
    borderRadius: { control: 'radio', options: Object.keys(popoverRadii) }
  },
  args: {
    side: 'bottom',
    align: 'center',
    elevation: 'raised',
    padding: 4,
    borderRadius: 'medium'
  },
  render: ({ side, align, elevation, padding, borderRadius, ...args }) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant='outline' />}>Summon popover</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
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
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Summon popover' }))
    const popover = await body.findByRole('dialog')
    await expect(within(popover).getByPlaceholderText('First dial')).toHaveValue('100%')

    // Clicking outside dismisses the popover.
    await userEvent.click(document.body)
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  }
}

const sides = ['top', 'right', 'bottom', 'left'] as const

/** Each side opens its own popover; the popup flips when the canvas leaves it no room, so the side is not asserted. */
export const Placement: Story = {
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
    const body = within(document.body)
    for (const side of sides) {
      await userEvent.click(
        within(cellOf(canvasElement, 'side', side)).getByRole('button', { name: side })
      )
      const popover = await body.findByRole('dialog', { name: `Levitate ${side}` })
      await expect(popover).toHaveTextContent(`to the ${side} of the trigger`)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
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
    const body = within(document.body)
    const canvas = within(canvasElement)
    const seen = new Set<string>()
    for (const elevation of elevations) {
      const token = getComputedStyle(await canvas.findByTestId(`probe-${elevation}`)).boxShadow
      const drawn = getComputedStyle(await body.findByText(`Elevation ${elevation}`)).boxShadow
      // The popup layers its edge ring first and the token after it.
      await expect(drawn.endsWith(token)).toBe(true)
      seen.add(token)
    }
    await expect(seen.size).toBe(3)
  }
}

const steps = { '0': 0, '2': 2, '4': 4, '8': 8 } as const
const paddings = ['0', '2', '4', '8'] as const

/** Padding counts `unit` steps: `4` (16px) is the default, `0` leaves the content flush. All stay open for the a11y gate. */
export const Paddings: Story = {
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
    const body = within(document.body)
    const padding = async (name: string) =>
      getComputedStyle(await body.findByRole('dialog', { name: `Padding ${name}` })).paddingTop
    // One step is 4px; the default is four steps.
    for (const name of paddings) await expect(await padding(name)).toBe(`${steps[name] * 4}px`)
  }
}

const radii = ['medium', 'large'] as const

/** The corner radius of the popup; `medium` is the default. */
export const Radii: Story = {
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
    const body = within(document.body)
    const corner = async (radius: string) =>
      getComputedStyle(await body.findByRole('dialog', { name: `Radius ${radius}` }))
        .borderTopLeftRadius
    await expect(await corner('medium')).toBe('8px')
    await expect(await corner('large')).toBe('10px')
  }
}
