import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
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

const meta = {
  title: 'Base Components/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
  argTypes: {
    open: { control: 'boolean' }
  },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div
        {...stylex.props(
          atoms.display.flex,
          atoms.justifyContent.center,
          atoms.padding['20px'],
          atoms.minWidth['448px'],
          atoms.width['100%']
        )}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Popover>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  pair: { display: 'flex', gap: 160, paddingTop: 64 },
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

export const Playground: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant='outline' />}>Summon popover</PopoverTrigger>
      <PopoverContent>
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

export const Placement: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant='outline' />}>Levitate above</PopoverTrigger>
      <PopoverContent side='top' align='start'>
        Wingardium Leviosa — hovering above the trigger.
      </PopoverContent>
    </Popover>
  )
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
          <Button type='submit' size='sm'>
            Save permit
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

/** The two shadow depths, side by side; both stay open so the a11y gate sees them. */
export const Elevations: Story = {
  render: () => (
    <div {...stylex.props(styles.pair)}>
      {(['overlay', 'raised'] as const).map((elevation) => (
        <Popover key={elevation} defaultOpen>
          <PopoverTrigger render={<Button variant='outline' />}>{elevation}</PopoverTrigger>
          <PopoverContent elevation={elevation} side='bottom' aria-label={`${elevation} notice`}>
            {`Elevation ${elevation}`}
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
  play: async () => {
    const body = within(document.body)
    const shadow = async (elevation: string) =>
      getComputedStyle(await body.findByText(`Elevation ${elevation}`)).boxShadow
    await expect(await shadow('raised')).not.toBe(await shadow('overlay'))
  }
}
