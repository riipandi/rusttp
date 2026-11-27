import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent } from 'storybook/test'
import { cellOf, expectBoxSizes, expectDisabledLook } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Label } from '../../extra/label'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../field'
import { Switch } from './switch.component'
import { switchRootSizes } from './switch.stylex'

const meta = {
  title: 'Base Components/Switch',
  component: Switch,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Switch>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  label: {
    alignItems: 'center',
    display: 'flex',
    gap: 8
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 24
  }
})

export default meta

export const Playground: Story = {
  // `defaultChecked` only seeds the state, so the render remounts the switch when it changes.
  parameters: {
    controls: { disable: false, include: ['size', 'defaultChecked', 'disabled', 'readOnly'] }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(switchRootSizes) },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' }
  },
  args: { size: 'medium', defaultChecked: true, disabled: false, readOnly: false },
  render: (args) => (
    <label {...stylex.props(styles.label)}>
      <Switch key={String(args.defaultChecked)} {...args} aria-label='Invisibility Cloak' />{' '}
      Invisibility Cloak
    </label>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('switch', { name: /Invisibility Cloak/ })
    await expect(el).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(el)
    await expect(el).toHaveAttribute('aria-checked', 'false')

    // Keyboard toggles as well.
    el.focus()
    await userEvent.keyboard(' ')
    await expect(el).toHaveAttribute('aria-checked', 'true')
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Label>
  <Switch size='small' defaultChecked />
  small
</Label>
<Label>
  <Switch size='large' defaultChecked />
  large
</Label>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={['small', 'medium', 'large'] as const}>
      {(size) => (
        <Label>
          <Switch size={size} defaultChecked />
          {size}
        </Label>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) =>
    expectBoxSizes(canvasElement, '[role="switch"]', {
      small: [28, 16],
      medium: [36, 20],
      large: [48, 24]
    })
}

export const Description: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Field orientation='horizontal'>
  <FieldContent>
    <FieldLabel htmlFor='marketing'>Owl post from Gringotts</FieldLabel>
    <FieldDescription>Receive Daily Prophet updates about new vault services.</FieldDescription>
  </FieldContent>
  <Switch id='marketing' />
</Field>`
      }
    }
  },
  render: () => (
    <Field orientation='horizontal'>
      <FieldContent>
        <FieldLabel htmlFor='switch-description-marketing'>Owl post from Gringotts</FieldLabel>
        <FieldDescription>Receive Daily Prophet updates about new vault services.</FieldDescription>
      </FieldContent>
      <Switch id='switch-description-marketing' />
    </Field>
  )
}

const states = ['off', 'on', 'disabled', 'invalid'] as const

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Label>
  <Switch aria-label='Invisibility Cloak on' defaultChecked />
  Invisibility Cloak on
</Label>
<Label>
  <Switch aria-label='Invisibility Cloak disabled' disabled />
  Invisibility Cloak disabled
</Label>
<Field orientation='horizontal' invalid>
  <FieldContent>
    <FieldLabel htmlFor='two-factor'>Gringotts security charms</FieldLabel>
    <FieldError>A security charm is required to enter your vault.</FieldError>
  </FieldContent>
  <Switch id='two-factor' />
</Field>`
      }
    }
  },
  render: () => (
    <Axis axis='state' rows={states}>
      {(state) =>
        state === 'invalid' ? (
          <Field orientation='horizontal' invalid>
            <FieldContent>
              <FieldLabel htmlFor='switch-invalid-two-factor'>Gringotts security charms</FieldLabel>
              <FieldError>A security charm is required to enter your vault.</FieldError>
            </FieldContent>
            <Switch id='switch-invalid-two-factor' />
          </Field>
        ) : (
          <Label>
            <Switch
              aria-label={`Invisibility Cloak ${state}`}
              defaultChecked={state === 'on'}
              disabled={state === 'disabled'}
            />
            Invisibility Cloak {state}
          </Label>
        )
      }
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const control = (state: string) => {
      const el = cellOf(canvasElement, 'state', state).querySelector('[role="switch"]')
      if (!el) throw new Error(`No switch for ${state}`)
      return el
    }
    await expect(control('off')).toHaveAttribute('aria-checked', 'false')
    await expect(control('on')).toHaveAttribute('aria-checked', 'true')

    const disabled = control('disabled')
    await expect(disabled).toHaveAttribute('data-disabled')
    await expectDisabledLook(disabled, { fill: true })
    await userEvent.click(disabled)
    await expect(disabled).toHaveAttribute('aria-checked', 'false')

    await expect(control('invalid')).toHaveAttribute('data-invalid')
  }
}

/** Tab reaches a switch, Space and Enter flip it, and Tab skips a disabled switch. */
export const Keyboard: Story = {
  render: () => (
    <>
      <Label>
        <Switch aria-label='Invisibility Cloak' /> Invisibility Cloak
      </Label>
      <Label>
        <Switch disabled aria-label='Elder Wand' /> Elder Wand
      </Label>
      <Label>
        <Switch aria-label='Resurrection Stone' /> Resurrection Stone
      </Label>
    </>
  ),
  play: async ({ canvas }) => {
    const cloak = canvas.getByRole('switch', { name: /Invisibility Cloak/ })
    const wand = canvas.getByRole('switch', { name: /Elder Wand/ })
    const stone = canvas.getByRole('switch', { name: /Resurrection Stone/ })

    await userEvent.tab()
    await expect(cloak).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(cloak).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{Enter}')
    await expect(cloak).toHaveAttribute('aria-checked', 'false')

    await userEvent.tab()
    await expect(wand).not.toHaveFocus()
    await expect(stone).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(stone).toHaveAttribute('aria-checked', 'true')
  }
}
