import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { cellOf, expectBoxSizes, expectDisabledLook } from '../../contracts/control-sizes'
import { mediaRules, pose } from '../../contracts/motion'
import { Axis } from '../../contracts/story-axes'
import { Label } from '../../extra/label'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../field'
import { Checkbox, CheckboxGroup } from './checkbox.component'
import { checkboxSizes } from './checkbox.stylex'

const meta = {
  title: 'Base Components/Checkbox',
  component: Checkbox
} satisfies Meta<typeof Checkbox>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  child: { marginLeft: 24 }
})

const notifications = ['comments', 'mentions', 'follows']

export default meta

export const Playground: Story = {
  // `defaultChecked` only seeds the state, so the render remounts the box when it changes.
  parameters: {
    controls: {
      disable: false,
      include: ['size', 'defaultChecked', 'disabled', 'indeterminate', 'readOnly']
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(checkboxSizes) },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    readOnly: { control: 'boolean' }
  },
  args: {
    size: 'medium',
    defaultChecked: true,
    disabled: false,
    indeterminate: false,
    readOnly: false
  },
  render: (args) => (
    <Label>
      <Checkbox
        key={String(args.defaultChecked)}
        {...args}
        aria-label='Accept the Hogwarts letter'
      />{' '}
      Accept the Hogwarts letter and its terms
    </Label>
  ),
  play: async ({ canvas }) => {
    // The accessible name combines aria-label and the label text.
    const el = canvas.getByRole('checkbox', { name: /Accept the Hogwarts letter/ })
    await expect(el).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(el)
    await expect(el).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(el)
    await expect(el).toHaveAttribute('aria-checked', 'true')
  }
}

export const Description: Story = {
  render: () => (
    <Field orientation='horizontal'>
      <Checkbox id='checkbox-description-newsletter' defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor='checkbox-description-newsletter'>Daily Prophet</FieldLabel>
        <FieldDescription>
          Receive occasional owl-delivered updates and announcements from Hogwarts.
        </FieldDescription>
      </FieldContent>
    </Field>
  )
}

export const Group: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CheckboxGroup defaultValue={['newsletter']} aria-label='Owl post preferences'>
  <Label>
    <Checkbox name='newsletter' /> Daily Prophet
  </Label>
  <Label>
    <Checkbox name='product-updates' /> Ministry memos
  </Label>
  <Label>
    <Checkbox name='promotions' /> Weasleys' Wizard Wheezes deals
  </Label>
</CheckboxGroup>`
      }
    }
  },
  render: () => (
    <CheckboxGroup defaultValue={['newsletter']} aria-label='Owl post preferences'>
      <Label>
        <Checkbox name='newsletter' /> Daily Prophet
      </Label>
      <Label>
        <Checkbox name='product-updates' /> Ministry memos
      </Label>
      <Label>
        <Checkbox name='promotions' /> Weasleys&apos; Wizard Wheezes deals
      </Label>
    </CheckboxGroup>
  )
}

export const GroupWithParent: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CheckboxGroup
  value={value}
  onValueChange={setValue}
  allValues={['comments', 'mentions', 'follows']}
  aria-label='Owl post preferences'
>
  <Label>
    <Checkbox parent /> All owl post
  </Label>
  <Label style={…}>
    <Checkbox name='comments' /> Howlers
  </Label>
  <Label style={…}>
    <Checkbox name='mentions' /> Prophet mentions
  </Label>
  …
</CheckboxGroup>`
      }
    }
  },
  name: 'Group with parent',
  render: () => {
    const [value, setValue] = React.useState<string[]>(['comments'])

    return (
      <CheckboxGroup
        value={value}
        onValueChange={setValue}
        allValues={notifications}
        aria-label='Owl post preferences'
      >
        <Label>
          <Checkbox parent /> All owl post
        </Label>
        <Label style={styles.child}>
          <Checkbox name='comments' /> Howlers
        </Label>
        <Label style={styles.child}>
          <Checkbox name='mentions' /> Prophet mentions
        </Label>
        <Label style={styles.child}>
          <Checkbox name='follows' /> Quidditch updates
        </Label>
      </CheckboxGroup>
    )
  }
}

export const GroupPlay: StoryObj<{ handleValueChange: ReturnType<typeof fn> }> = {
  name: 'group (interaction)',
  args: { handleValueChange: fn() },
  render: (args) => (
    <CheckboxGroup
      defaultValue={['newsletter']}
      onValueChange={args.handleValueChange}
      aria-label='Owl post preferences'
    >
      <Label>
        <Checkbox name='newsletter' /> Daily Prophet
      </Label>
      <Label>
        <Checkbox name='product-updates' /> Ministry memos
      </Label>
      <Label>
        <Checkbox name='promotions' /> Weasleys&apos; Wizard Wheezes deals
      </Label>
    </CheckboxGroup>
  ),
  play: async ({ canvas, args }) => {
    const memos = canvas.getByRole('checkbox', { name: 'Ministry memos' })
    await userEvent.click(memos)
    await expect(memos).toHaveAttribute('aria-checked', 'true')
    // onValueChange carries (value, eventDetails) — check the value arg.
    await expect(args.handleValueChange.mock.calls[0]?.[0]).toEqual([
      'newsletter',
      'product-updates'
    ])

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Daily Prophet' }))
    await expect(args.handleValueChange.mock.calls[1]?.[0]).toEqual(['product-updates'])
  }
}

export const GroupParentPlay: Story = {
  name: 'group with parent (interaction)',
  render: () => {
    const [value, setValue] = React.useState<string[]>(['comments'])

    return (
      <CheckboxGroup
        value={value}
        onValueChange={setValue}
        allValues={notifications}
        aria-label='Owl post preferences'
      >
        <Label>
          <Checkbox parent /> All owl post
        </Label>
        <Label style={styles.child}>
          <Checkbox name='comments' /> Howlers
        </Label>
        <Label style={styles.child}>
          <Checkbox name='mentions' /> Prophet mentions
        </Label>
        <Label style={styles.child}>
          <Checkbox name='follows' /> Quidditch updates
        </Label>
      </CheckboxGroup>
    )
  },
  play: async ({ canvas }) => {
    const parent = canvas.getByRole('checkbox', { name: 'All owl post' })

    // One of three selected: the parent checkbox is indeterminate.
    await expect(parent).toHaveAttribute('aria-checked', 'mixed')

    // Selecting the parent checks every child.
    await userEvent.click(parent)
    await expect(parent).toHaveAttribute('aria-checked', 'true')
    for (const name of ['Howlers', 'Prophet mentions', 'Quidditch updates']) {
      await expect(canvas.getByRole('checkbox', { name })).toHaveAttribute('aria-checked', 'true')
    }

    // Selecting it again clears every child.
    await userEvent.click(parent)
    await expect(parent).toHaveAttribute('aria-checked', 'false')
    for (const name of ['Howlers', 'Prophet mentions', 'Quidditch updates']) {
      await expect(canvas.getByRole('checkbox', { name })).toHaveAttribute('aria-checked', 'false')
    }
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Label>
  <Checkbox size='small' defaultChecked aria-label='House-elf small' />
  small
</Label>
<Label>
  <Checkbox size='large' defaultChecked aria-label='House-elf large' />
  large
</Label>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={['small', 'medium', 'large'] as const}>
      {(size) => (
        <Label>
          <Checkbox size={size} defaultChecked aria-label={`House-elf ${size}`} />
          {size}
        </Label>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectBoxSizes(canvasElement, '[role="checkbox"]', {
      small: [12, 12],
      medium: [16, 16],
      large: [20, 20]
    })
}

const states = ['unchecked', 'checked', 'indeterminate', 'disabled', 'invalid'] as const

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Label>
  <Checkbox indeterminate aria-label='Select all Marauders' />
  Select all Marauders
</Label>
<Label>
  <Checkbox disabled defaultChecked aria-label='Select all Marauders disabled' />
  Select all Marauders disabled
</Label>
<Field orientation='horizontal' invalid>
  <Checkbox id='terms' />
  <FieldContent>
    <FieldLabel htmlFor='terms'>Accept the Hogwarts school rules</FieldLabel>
    <FieldError>You must accept the school rules before the Sorting begins.</FieldError>
  </FieldContent>
</Field>`
      }
    }
  },
  render: () => (
    <Axis axis='state' rows={states}>
      {(state) =>
        state === 'invalid' ? (
          <Field orientation='horizontal' invalid>
            <Checkbox id='checkbox-invalid-terms' />
            <FieldContent>
              <FieldLabel htmlFor='checkbox-invalid-terms'>
                Accept the Hogwarts school rules
              </FieldLabel>
              <FieldError>You must accept the school rules before the Sorting begins.</FieldError>
            </FieldContent>
          </Field>
        ) : (
          <Label>
            <Checkbox
              aria-label={`Select all Marauders ${state}`}
              defaultChecked={state === 'checked' || state === 'disabled'}
              indeterminate={state === 'indeterminate'}
              disabled={state === 'disabled'}
            />
            Select all Marauders {state}
          </Label>
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const box = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelector('[role="checkbox"]')
      if (!el) throw new Error(`No checkbox for ${state}`)
      return el
    }
    await expect(box('unchecked')).toHaveAttribute('aria-checked', 'false')
    await expect(box('checked')).toHaveAttribute('aria-checked', 'true')
    await expect(box('indeterminate')).toHaveAttribute('aria-checked', 'mixed')

    const disabled = box('disabled')
    await expect(disabled).toHaveAttribute('data-disabled')
    await expectDisabledLook(disabled, { edge: true, fill: true })
    await userEvent.click(disabled)
    await expect(disabled).toHaveAttribute('aria-checked', 'true')

    await expect(box('invalid')).toHaveAttribute('data-invalid')
  }
}

/** The check scales and fades in and out, and reduced motion keeps the fade and drops the scale. */
export const Motion: Story = {
  render: () => <Checkbox defaultChecked aria-label='Accept the Hogwarts letter' />,
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'Accept the Hogwarts letter' })
    const mark = () => box.querySelector<HTMLElement>(':scope > span')
    const indicator = mark()
    if (!indicator) throw new Error('A checked box renders its indicator')

    const style = getComputedStyle(indicator)
    await expect(style.transitionProperty).toBe('opacity, transform')
    await expect(style.transitionDuration).toBe('0.15s')
    // Base UI holds the starting and ending poses for one frame; both are the small, clear mark.
    for (const attribute of ['data-starting-style', 'data-ending-style']) {
      await expect(pose(indicator, attribute)).toEqual({
        opacity: '0',
        transform: 'matrix(0.6, 0, 0, 0.6, 0, 0)'
      })
    }
    await expect(
      mediaRules(indicator, 'prefers-reduced-motion').some(
        (rule) => rule.style.transitionProperty === 'opacity'
      )
    ).toBe(true)

    // The exit finishes: the mark leaves the box once its transition is done, and comes back.
    await userEvent.click(box)
    await waitFor(() => expect(mark()).toBeNull())
    await userEvent.click(box)
    await waitFor(() => expect(mark()).not.toBeNull())
  }
}

/** Tab reaches a checkbox, Space toggles it, Enter does not, and Tab skips a disabled one. */
export const Keyboard: Story = {
  render: () => (
    <>
      <Label>
        <Checkbox aria-label='Accept the Hogwarts letter' /> Accept the Hogwarts letter
      </Label>
      <Label>
        <Checkbox disabled aria-label='Join the Death Eaters' /> Join the Death Eaters
      </Label>
      <Label>
        <Checkbox aria-label='Subscribe to the Quibbler' /> Subscribe to the Quibbler
      </Label>
    </>
  ),
  play: async ({ canvas }) => {
    const letter = canvas.getByRole('checkbox', { name: /Accept the Hogwarts letter/ })
    const disabled = canvas.getByRole('checkbox', { name: /Join the Death Eaters/ })
    const quibbler = canvas.getByRole('checkbox', { name: /Subscribe to the Quibbler/ })

    await userEvent.tab()
    await expect(letter).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(letter).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard(' ')
    await expect(letter).toHaveAttribute('aria-checked', 'false')
    // Enter does not toggle a checkbox.
    await userEvent.keyboard('{Enter}')
    await expect(letter).toHaveAttribute('aria-checked', 'false')

    // Tab skips the disabled checkbox.
    await userEvent.tab()
    await expect(disabled).not.toHaveFocus()
    await expect(quibbler).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(quibbler).toHaveAttribute('aria-checked', 'true')
  }
}
