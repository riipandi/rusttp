import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Input } from '../input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from './field.component'

const meta = {
  title: 'Base Components/Field',
  component: Field,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Field>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: {
    width: container.small
  }
})

export default meta

export const Playground: Story = {
  render: () => (
    <FieldSet style={styles.root}>
      <FieldLegend>Ministry of Magic security pass</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor='field-name'>Wizard name</FieldLabel>
          <Input id='field-name' placeholder='Hermione Granger' />
          <FieldDescription>Embossed on your Daily Prophet press badge.</FieldDescription>
        </Field>
        <FieldSeparator>Owl contact</FieldSeparator>
        <Field>
          <FieldLabel htmlFor='field-email'>Owl post address</FieldLabel>
          <Input id='field-email' type='email' placeholder='hermione.granger@hogwarts.edu' />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

/** The legend of a fieldset in its two looks: a heading (`legend`) or the size of a label. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={['legend', 'label'] as const}>
      {(variant) => (
        <FieldSet>
          <FieldLegend variant={variant}>{`Owl post ${variant}`}</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>{`Address ${variant}`}</FieldLabel>
              <Input placeholder='hermione.granger@hogwarts.edu' />
            </Field>
          </FieldGroup>
        </FieldSet>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const size = (variant: string) =>
      Number.parseFloat(getComputedStyle(canvas.getByText(`Owl post ${variant}`)).fontSize)
    await expect(size('legend')).toBeGreaterThan(size('label'))
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'invalid'] as const}>
      {(state) => (
        <Field invalid={state === 'invalid'}>
          <FieldLabel>{`Owl post address ${state}`}</FieldLabel>
          <Input placeholder='hermione.granger@hogwarts.edu' />
          {state === 'invalid' ? (
            <FieldError>You must accept the school rules before the Sorting begins.</FieldError>
          ) : null}
        </Field>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const invalid = canvas.getByRole('textbox', { name: 'Owl post address invalid' })
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(
      canvas.getByRole('textbox', { name: 'Owl post address default' })
    ).not.toHaveAttribute('aria-invalid', 'true')
  }
}

export const AutoWiring: Story = {
  name: 'auto wiring',
  render: () => (
    <Field>
      <FieldLabel>Owl post address</FieldLabel>
      <Input placeholder='hermione.granger@hogwarts.edu' />
      <FieldDescription>Owls reply within two days.</FieldDescription>
    </Field>
  ),
  // Field wires label, description, and validation to the control without
  // explicit ids.
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Owl post address' })
    const describedBy = input.getAttribute('aria-describedby')
    await expect(describedBy).toBeTruthy()
    await expect(document.getElementById(describedBy ?? '')).toHaveTextContent(
      'Owls reply within two days.'
    )
  }
}
