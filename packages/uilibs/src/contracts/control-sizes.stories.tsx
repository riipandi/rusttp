import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Autocomplete, AutocompleteInput } from '../base/autocomplete'
import { Button } from '../base/button'
import { Combobox, ComboboxInput, ComboboxTrigger } from '../base/combobox'
import { Input } from '../base/input'
import { NumberField, NumberFieldGroup } from '../base/number-field'
import { OTPField, OTPFieldGroup, OTPFieldSlot } from '../base/otp-field'
import { Select, SelectTrigger, SelectValue } from '../base/select'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../extra/input-group'
import { InputPassword } from '../extra/input-password'
import { InputPhone } from '../extra/input-phone'
import { HiddenLabel, controlSizeNames } from './control-sizes'

const meta = {
  title: 'Contracts/Control sizes',
  parameters: { layout: 'centered' }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  row: { display: 'contents' },
  grid: {
    alignItems: 'start',
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(3, 240px)',
    padding: 20
  }
})

const houses = [{ label: 'Gryffindor', value: 'gryffindor' }]

/** Every text control beside a Button of the same size: one row of equal heights per size. */
export const BesideAButton: Story = {
  render: () => (
    <div {...stylex.props(styles.grid)}>
      {controlSizeNames.map((size) => (
        <div key={size} data-size={size} {...stylex.props(styles.row)}>
          <Button size={size}>Alohomora</Button>
          <Input size={size} aria-label='Spell' placeholder='Spell' />
          <Select items={houses}>
            <SelectTrigger size={size} aria-label='House'>
              <SelectValue placeholder='House' />
            </SelectTrigger>
          </Select>
          <Combobox items={['Hogwarts']}>
            <ComboboxInput size={size} aria-label='School' placeholder='School' />
          </Combobox>
          <Combobox items={['Hogwarts']}>
            <ComboboxTrigger size={size} aria-label='School list'>
              School
            </ComboboxTrigger>
          </Combobox>
          <Autocomplete items={['Hogwarts']}>
            <AutocompleteInput size={size} aria-label='Place' placeholder='Place' />
          </Autocomplete>
          <NumberField size={size} defaultValue={7} id={`galleons-${size}`}>
            <NumberFieldGroup />
          </NumberField>
          <HiddenLabel htmlFor={`galleons-${size}`}>Galleons</HiddenLabel>
          <NumberField size={size} defaultValue={7} id={`sickles-${size}`}>
            <NumberFieldGroup controls='sides' />
          </NumberField>
          <HiddenLabel htmlFor={`sickles-${size}`}>Sickles</HiddenLabel>
          <InputGroup size={size}>
            <InputGroupAddon>
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput aria-label='Owl' placeholder='Owl' />
          </InputGroup>
          <InputPassword size={size} aria-label='Password' placeholder='Password' />
          <InputPhone size={size} aria-label='Phone' placeholder='Phone' />
          <OTPField size={size} length={4} aria-label='Code'>
            <OTPFieldGroup>
              {[1, 2, 3, 4].map((position) => (
                <OTPFieldSlot key={position} aria-label={`Character ${position} of 4`} />
              ))}
            </OTPFieldGroup>
          </OTPField>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const size of controlSizeNames) {
      const row = canvasElement.querySelector(`[data-size="${size}"]`)
      const button = row?.firstElementChild
      if (!button) throw new Error(`No button for size ${size}`)
      const expected = button.getBoundingClientRect().height
      // Select and Combobox roots also render a visually hidden form input; labels are not controls.
      const heights = Array.from(row?.children ?? [])
        .filter(
          (control) => control.getAttribute('aria-hidden') !== 'true' && control.tagName !== 'LABEL'
        )
        .map((control) => ({
          control:
            (control.querySelector('[aria-label]') ?? control).getAttribute('aria-label') ??
            control.tagName,
          height: control.getBoundingClientRect().height
        }))
      for (const { control, height } of heights) {
        await expect({ size, control, height }).toEqual({ size, control, height: expected })
      }
    }
  }
}
