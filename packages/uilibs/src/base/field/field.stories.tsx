import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect } from 'storybook/test'
import { expectDisabledLook, expectTypeRole } from '../../contracts/control-sizes'
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

// The legend's `kind` is a `FieldLegend` prop; the rest reach both Fields.
type PlaygroundArgs = Pick<ComponentProps<typeof Field>, 'orientation' | 'invalid' | 'disabled'> &
  Pick<ComponentProps<typeof FieldLegend>, 'kind'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['orientation', 'invalid', 'disabled', 'kind'] },
    docs: {
      source: {
        code: `<FieldSet>
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
</FieldSet>`
      }
    }
  },
  argTypes: {
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    kind: { control: 'radio', options: ['legend', 'label'] }
  },
  args: { orientation: 'vertical', invalid: false, disabled: false, kind: 'legend' },
  render: ({ orientation, invalid, disabled, kind }) => (
    <FieldSet style={styles.root}>
      <FieldLegend kind={kind}>Ministry of Magic security pass</FieldLegend>
      <FieldGroup>
        <Field orientation={orientation} invalid={invalid} disabled={disabled}>
          <FieldLabel htmlFor='field-name'>Wizard name</FieldLabel>
          <Input id='field-name' placeholder='Hermione Granger' />
          <FieldDescription>Embossed on your Daily Prophet press badge.</FieldDescription>
        </Field>
        <FieldSeparator>Owl contact</FieldSeparator>
        <Field orientation={orientation} invalid={invalid} disabled={disabled}>
          <FieldLabel htmlFor='field-email'>Owl post address</FieldLabel>
          <Input id='field-email' type='email' placeholder='hermione.granger@hogwarts.edu' />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

/** The legend of a fieldset in its two looks: a heading (`legend`) or the size of a label. */
export const Kinds: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FieldSet>
  <FieldLegend kind='label'>Owl post label</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel>Address label</FieldLabel>
      <Input placeholder='hermione.granger@hogwarts.edu' />
    </Field>
  </FieldGroup>
</FieldSet>`
      }
    }
  },
  render: () => (
    <Axis axis='kind' rows={['legend', 'label'] as const}>
      {(kind) => (
        <FieldSet>
          <FieldLegend kind={kind}>{`Owl post ${kind}`}</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>{`Address ${kind}`}</FieldLabel>
              <Input placeholder='hermione.granger@hogwarts.edu' />
            </Field>
          </FieldGroup>
        </FieldSet>
      )}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const size = (kind: string) =>
      Number.parseFloat(getComputedStyle(canvas.getByText(`Owl post ${kind}`)).fontSize)
    await expect(size('legend')).toBeGreaterThan(size('label'))
    // A fieldset is a group named by its legend.
    await expect(canvas.getByRole('group', { name: 'Owl post legend' })).toBeInTheDocument()
    await expect(canvas.getByRole('group', { name: 'Owl post label' })).toBeInTheDocument()
  }
}

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Field invalid>
  <FieldLabel>Owl post address invalid</FieldLabel>
  <Input placeholder='hermione.granger@hogwarts.edu' />
  <FieldError>You must accept the school rules before the Sorting begins.</FieldError>
</Field>`
      }
    }
  },
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

/** External errors (from a form library) render through the Field, so the input describes itself with them. */
export const ExternalErrors: Story = {
  render: () => (
    <Field invalid>
      <FieldLabel>Owl post address</FieldLabel>
      <Input placeholder='hermione.granger@hogwarts.edu' />
      <FieldDescription>Owls reply within two days.</FieldDescription>
      <FieldError errors={[{ message: 'The owl cannot find that address.' }]} />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Owl post address' })
    const error = canvas.getByRole('alert')
    await expect(error).toHaveTextContent('The owl cannot find that address.')
    await expect(error.id).toBeTruthy()
    await expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(error.id)
    await expect(input).toHaveAccessibleDescription(/The owl cannot find that address\./)
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
    await expectTypeRole(canvas.getByText('Owl post address'), 'body2')
    const describedBy = input.getAttribute('aria-describedby')
    await expect(describedBy).toBeTruthy()
    await expect(document.getElementById(describedBy ?? '')).toHaveTextContent(
      'Owls reply within two days.'
    )
  }
}

const looks = (el: HTMLElement) => {
  const style = getComputedStyle(el)
  return [style.opacity, style.color, style.borderTopColor, style.backgroundColor]
}

/**
 * A disabled control is drawn with the disabled tokens, not with opacity, so a disabled input inside
 * a disabled Field looks the same as a disabled input alone: opacity stacks, a color does not.
 */
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(styles.root)}>
      <Input aria-label='Alone' disabled placeholder='Alone' />
      <Field disabled>
        <FieldLabel>Within a field</FieldLabel>
        <Input placeholder='Within a field' />
      </Field>
    </div>
  ),
  play: async ({ canvas }) => {
    const alone = canvas.getByRole('textbox', { name: 'Alone' })
    const within = canvas.getByRole('textbox', { name: 'Within a field' })
    await expectDisabledLook(alone, { text: true, edge: true })
    await expectDisabledLook(within, { text: true, edge: true })
    await expect(looks(within)).toEqual(looks(alone))
  }
}
