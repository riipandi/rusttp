import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, within } from 'storybook/test'
import { pressUntil } from '../contracts/keyboard'
import { container } from '../styles/tokens.stylex'
import { Field, FieldDescription, FieldGroup, FieldLabel } from './field'
import { Input } from './input'
import { UIProvider } from './provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Slider } from './slider'

const meta = {
  title: 'Base Components/UIProvider',
  component: UIProvider,
  tags: [] // ['autodocs']
} satisfies Meta<typeof UIProvider>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: { maxWidth: container.small }
})

export default meta

const houses = [
  { label: 'Gryffindor', value: 'gryffindor' },
  { label: 'Hufflepuff', value: 'hufflepuff' },
  { label: 'Ravenclaw', value: 'ravenclaw' },
  { label: 'Slytherin', value: 'slytherin' }
]

/** The center of an element's box, measured from the left edge of the viewport. */
const centerX = (element: Element) => {
  const box = element.getBoundingClientRect()
  return box.left + box.width / 2
}

/**
 * A right-to-left form needs two things, and `UIProvider` is one of them. The `dir` attribute on
 * the document (or a subtree) makes the layout, the logical StyleX properties, and the text run
 * right to left. `UIProvider direction='rtl'` tells the Base UI parts that read a direction in
 * script: a slider's arrow keys, a menu's submenu keys, a tab list's roving focus.
 */
export const RightToLeft: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div dir='rtl'>
  <UIProvider direction='rtl'>
    <FieldGroup>
      <Field>
        <FieldLabel>Wizard name</FieldLabel>
        <Input defaultValue='هيرميون' />
      </Field>
      <Field>
        <FieldLabel>House</FieldLabel>
        <Select items={houses} defaultValue='ravenclaw'>…</Select>
      </Field>
      <Field>
        <FieldLabel>Spell power</FieldLabel>
        <Slider defaultValue={[25]} aria-label='Spell power' />
        <FieldDescription>…</FieldDescription>
      </Field>
    </FieldGroup>
  </UIProvider>
</div>`
      }
    }
  },
  render: () => (
    <div dir='rtl' lang='ar'>
      <UIProvider direction='rtl'>
        <FieldGroup style={styles.root}>
          <Field>
            <FieldLabel>Wizard name</FieldLabel>
            <Input defaultValue='هيرميون' />
          </Field>
          <Field>
            <FieldLabel>House</FieldLabel>
            <Select items={houses} defaultValue='ravenclaw'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {houses.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Spell power</FieldLabel>
            <Slider defaultValue={[25]} aria-label='Spell power' />
            <FieldDescription>The thumb starts at the right edge</FieldDescription>
          </Field>
        </FieldGroup>
      </UIProvider>
    </div>
  ),
  play: async ({ canvas }) => {
    // The text runs right to left, and the select's chevron sits at the end, which is the left.
    const input = canvas.getByRole('textbox', { name: 'Wizard name' })
    await expect(getComputedStyle(input).direction).toBe('rtl')
    const select = canvas.getByRole('combobox', { name: 'House' })
    const chevron = select.querySelector('svg')
    if (!chevron) throw new Error('No chevron in the select trigger')
    await expect(centerX(chevron)).toBeLessThan(centerX(select))

    // The slider's minimum is at the right: a value of 25 puts the thumb right of the middle.
    const thumb = canvas.getByRole('slider', { name: 'Spell power' })
    // The input sits in the thumb, and the thumb in the control that spans the track.
    const control = thumb.closest('[data-orientation]')?.parentElement
    if (!control) throw new Error('No slider control around the thumb')
    await expect(centerX(thumb)).toBeGreaterThan(centerX(control))

    // `direction='rtl'` reaches Base UI: ArrowLeft moves the thumb toward the maximum.
    thumb.focus()
    await expect(thumb).toHaveFocus()
    await pressUntil('{ArrowLeft}', () => expect(thumb).toHaveAttribute('aria-valuenow', '26'), {
      when: () => thumb.getAttribute('aria-valuenow') === '25'
    })

    // The select still opens from the keyboard and lists every house.
    const body = within(document.body)
    select.focus()
    await pressUntil('{Enter}', () => expect(body.getByRole('listbox')).toBeVisible(), {
      when: () => !body.queryByRole('listbox')
    })
    await expect(body.getAllByRole('option')).toHaveLength(houses.length)
    await pressUntil('{Escape}', () => expect(body.queryByRole('listbox')).toBeNull())
  }
}
