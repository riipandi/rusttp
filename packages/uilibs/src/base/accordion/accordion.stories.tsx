import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion.component'

const meta = {
  title: 'Base Components/Accordion',
  component: Accordion,
  argTypes: {
    multiple: { control: 'boolean' }
  },
  tags: [] // ['autodocs']
} satisfies Meta<typeof Accordion>

type Story = StoryObj<typeof meta>

export default meta

export const Playground: Story = {
  args: { multiple: false, defaultValue: ['item-1'] },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Is the vault accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It follows the Gringotts access pattern and unlocks with a spoken Alohomora.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>Is it enchanted?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default charms that match the other artefacts in the collection.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It animates open with the panel height, as if lifted by Wingardium Leviosa.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled'] as const}>
      {(state) => (
        <Accordion>
          <AccordionItem value='item-1'>
            <AccordionTrigger>Available vault</AccordionTrigger>
            <AccordionContent>This vault can be selected and configured.</AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2' disabled={state === 'disabled'}>
            <AccordionTrigger>Ministry vault (restricted)</AccordionTrigger>
            <AccordionContent>
              Contact the Department of Mysteries to unlock this vault.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const triggers = (state: string) => {
      const [available, restricted] = Array.from(
        cellOf(canvasElement, 'state', state).querySelectorAll('button')
      )
      if (!available || !restricted) throw new Error(`Accordion triggers not found for ${state}`)
      return { available, restricted }
    }
    // Disabled item: marked with data-disabled and never expands.
    const disabled = triggers('disabled')
    await expect(disabled.restricted).toHaveAttribute('data-disabled')
    await userEvent.click(disabled.restricted)
    await expect(disabled.restricted).toHaveAttribute('aria-expanded', 'false')

    // The enabled sibling still works.
    await userEvent.click(disabled.available)
    await expect(disabled.available).toHaveAttribute('aria-expanded', 'true')

    const enabled = triggers('default')
    await expect(enabled.restricted).not.toHaveAttribute('data-disabled')
    await userEvent.click(enabled.restricted)
    await expect(enabled.restricted).toHaveAttribute('aria-expanded', 'true')
  }
}

/** The chevron before or after the label; only the look moves, so the keyboard works the same. */
export const IconPositions: Story = {
  render: () => (
    <Axis axis='icon' rows={['end', 'start'] as const}>
      {(position) => (
        <Accordion>
          <AccordionItem value='item-1'>
            <AccordionTrigger
              iconPosition={position}
            >{`Chamber of Secrets ${position}`}</AccordionTrigger>
            <AccordionContent>Only the heir of Slytherin may open it.</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const parts = (position: string) => {
      const trigger = cellOf(canvasElement, 'icon', position).querySelector('button')
      const chevron = trigger?.querySelector('svg')
      if (!trigger || !chevron) throw new Error(`No trigger for ${position}`)
      return {
        trigger,
        chevron: chevron.getBoundingClientRect(),
        box: trigger.getBoundingClientRect()
      }
    }
    // `end` pins the chevron to the trailing edge; `start` puts it on the leading edge, before the label.
    const end = parts('end')
    await expect(Math.round(end.box.right - end.chevron.right)).toBe(0)
    const start = parts('start')
    await expect(Math.round(start.chevron.left - start.box.left)).toBe(0)
    const range = document.createRange()
    range.selectNodeContents(start.trigger)
    const label = Array.from(start.trigger.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE
    )
    if (!label) throw new Error('No label')
    range.selectNodeContents(label)
    await expect(range.getBoundingClientRect().left).toBeGreaterThan(start.chevron.right)

    // The DOM order is unchanged, so the label is still the first child and the keyboard opens it.
    await expect(start.trigger.firstChild?.nodeType).toBe(Node.TEXT_NODE)
    start.trigger.focus()
    await userEvent.keyboard('{Enter}')
    await expect(start.trigger).toHaveAttribute('aria-expanded', 'true')
  }
}

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['item-1', 'item-2'] },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Can I unlock more than one chamber?</AccordionTrigger>
        <AccordionContent>
          Yes. Pass `multiple` to keep several chambers open at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>Is each horcrux tracked separately?</AccordionTrigger>
        <AccordionContent>
          Yes. Each fragment keeps its own state, hidden like Tom Riddle&apos;s diary.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>Can I set an initial selection?</AccordionTrigger>
        <AccordionContent>
          Yes, via `defaultValue` — the values that start open, like the dials of a cryptex.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const OpenClose: Story = {
  name: 'open/close',
  args: { multiple: false },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Alohomora</AccordionTrigger>
        <AccordionContent>Unlocked.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Alohomora' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    // The closed panel is not mounted.
    await expect(canvas.queryByText('Unlocked.')).toBeNull()

    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByText('Unlocked.')).toBeVisible())
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.queryByText('Unlocked.')).toBeNull())
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  }
}

export const OnValueChange: StoryObj<{ handleValueChange: ReturnType<typeof fn> }> = {
  name: 'onValueChange',
  args: { handleValueChange: fn() },
  render: (args) => (
    <Accordion onValueChange={args.handleValueChange}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Sonorus</AccordionTrigger>
        <AccordionContent>Louder.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole('button', { name: 'Sonorus' })
    await userEvent.click(trigger)
    await expect(args.handleValueChange).toHaveBeenCalledTimes(1)
    // The value is the (array of) open item values.
    const value = args.handleValueChange.mock.calls[0]?.[0]
    await expect(Array.isArray(value) ? value : [value]).toContain('item-1')

    await userEvent.click(trigger)
    await expect(args.handleValueChange).toHaveBeenCalledTimes(2)
  }
}

export const MultiplePlay: Story = {
  name: 'multiple (interaction)',
  args: { multiple: true },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Can I unlock more than one chamber?</AccordionTrigger>
        <AccordionContent>
          Yes. Pass `multiple` to keep several chambers open at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>Is each horcrux tracked separately?</AccordionTrigger>
        <AccordionContent>
          Yes. Each fragment keeps its own state, hidden like Tom Riddle&apos;s diary.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: /unlock more than one chamber/i })
    const second = canvas.getByRole('button', { name: /horcrux tracked separately/i })

    await userEvent.click(first)
    await userEvent.click(second)
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
  }
}

export const Keyboard: Story = {
  args: { multiple: false },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Is the vault accessible?</AccordionTrigger>
        <AccordionContent>Yes, with a spoken Alohomora.</AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>Is it enchanted?</AccordionTrigger>
        <AccordionContent>Yes, with the default charms.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: 'Is the vault accessible?' })
    const second = canvas.getByRole('button', { name: 'Is it enchanted?' })

    // Tab lands on the first trigger; Enter opens it, Space closes it.
    await userEvent.tab()
    await expect(first).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard(' ')
    await expect(first).toHaveAttribute('aria-expanded', 'false')

    // Every trigger is a tab stop: Base UI's accordion has no arrow-key navigation.
    await userEvent.tab()
    await expect(second).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
  }
}
