// Compiled, these Formisch fields stop updating (validation messages never show,
// the captcha never toggles) and the compiler reports nothing; e2e `auth.spec.ts`
// catches it.
'use no memo'

import type { FieldElementProps } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Checkbox } from 'uilibs/base/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from 'uilibs/base/field'
import { Input } from 'uilibs/base/input'
import { OTPField, OTPFieldGroup, OTPFieldSeparator, OTPFieldSlot } from 'uilibs/base/otp-field'
import { InputPassword } from 'uilibs/extra/input-password'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontLineHeight, fontSize, radius, unit } from 'uilibs/styles/tokens.stylex'
import { useMessages } from '#/libraries/messages'

const styles = stylex.create({
  hint: {
    marginBlockStart: `calc(-1 * ${unit.x1})`,
    paddingInline: unit.x1,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2
  },
  warning: {
    display: 'block',
    margin: 0,
    color: colors.foregroundWarning,
    fontSize: fontSize.caption1
  },
  code: {
    width: '100%'
  },
  group: {
    flex: 1,
    minWidth: 0
  },
  slot: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 0,
    width: 'auto',
    height: unit.x12,
    fontSize: fontSize.featured5
  },
  check: {
    display: 'flex',
    alignItems: 'center',
    gap: unit.x2,
    fontSize: fontSize.body2,
    cursor: 'pointer'
  },
  captcha: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: unit.x3,
    minHeight: unit.x12,
    paddingBlock: unit.x2,
    paddingInline: unit.x4,
    backgroundColor: colors.backgroundNeutralFaded,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderControl,
    borderRadius: radius.medium
  },
  captchaInvalid: {
    borderColor: colors.borderCritical
  }
})

/** What a field component reads of a Formisch field store, by the type of value it edits. */
interface FieldLike<T> {
  /** `undefined` until the field has a value: Formisch types the input as partial. */
  readonly input: T | undefined
  readonly errors: [string, ...string[]] | null
  readonly onChange: (value: T) => void
  readonly props: FieldElementProps
}

/** One message at a time: the first rule that failed, the next one shows once it is fixed. */
const messagesOf = (field: Pick<FieldLike<unknown>, 'errors'>) =>
  field.errors ? [{ message: field.errors[0] }] : []

interface TextFieldProps {
  field: FieldLike<string>
  /** The visible label above the field, which is also its accessible name. */
  label: string
  description?: string
  autoComplete?: string
  /** Not `type='email'`: native type validity would block the submit before Valibot can speak. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}

export function TextField({ field, label, description, autoComplete, inputMode }: TextFieldProps) {
  const id = React.useId()
  const messages = messagesOf(field)

  return (
    <Field name={field.props.name} invalid={field.errors !== null}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...field.props}
        id={id}
        size='lg'
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={field.input ?? ''}
      />
      {messages.length > 0 ? (
        <FieldError errors={messages} style={styles.hint} />
      ) : (
        description && <FieldDescription style={styles.hint}>{description}</FieldDescription>
      )}
    </Field>
  )
}

export function PasswordField({
  field,
  label,
  description,
  autoComplete
}: Omit<TextFieldProps, 'inputMode'>) {
  const m = useMessages()
  const id = React.useId()
  const messages = messagesOf(field)
  const [capsLock, setCapsLock] = React.useState(false)

  return (
    <Field name={field.props.name} invalid={field.errors !== null}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputPassword
        {...field.props}
        id={id}
        size='lg'
        autoComplete={autoComplete}
        labels={{ show: m.form_password_show(), hide: m.form_password_hide() }}
        value={field.input ?? ''}
        onBlur={() => {
          field.props.onBlur()
          setCapsLock(false)
        }}
        onKeyDown={(event) => setCapsLock(event.getModifierState('CapsLock'))}
        onKeyUp={(event) => setCapsLock(event.getModifierState('CapsLock'))}
      />
      {messages.length > 0 ? (
        <FieldError errors={messages} style={styles.hint} />
      ) : (
        description && <FieldDescription style={styles.hint}>{description}</FieldDescription>
      )}
      {capsLock && <output {...stylex.props(styles.warning)}>{m.form_caps_lock()}</output>}
    </Field>
  )
}

/** The checkbox control itself; `inputRef` lets a failed submit focus it. */
function FieldCheckbox({ field, id }: { field: FieldLike<boolean>; id: string }) {
  return (
    <Checkbox
      id={id}
      name={field.props.name}
      inputRef={field.props.ref}
      checked={field.input ?? false}
      onCheckedChange={field.onChange}
      onFocus={field.props.onFocus}
      onBlur={field.props.onBlur}
    />
  )
}

export function CheckboxField({ field, label }: { field: FieldLike<boolean>; label: string }) {
  const id = React.useId()

  return (
    <label htmlFor={id} {...stylex.props(styles.check)}>
      <FieldCheckbox field={field} id={id} />
      {label}
    </label>
  )
}

// Placeholder for a captcha widget (Turnstile, hCaptcha, reCAPTCHA): a checkbox challenge with
// nothing verifying it. Swap the body for the provider's widget; the schema already requires it.
export function CaptchaField({ field }: { field: FieldLike<boolean> }) {
  const m = useMessages()
  const messages = messagesOf(field)
  const invalid = field.errors !== null
  const id = React.useId()

  return (
    <Field name={field.props.name} invalid={invalid}>
      <div {...stylex.props(styles.captcha, invalid && styles.captchaInvalid)}>
        <label htmlFor={id} {...stylex.props(styles.check)}>
          <FieldCheckbox field={field} id={id} />
          {m.form_captcha_label()}
        </label>
      </div>
      {invalid && <FieldError errors={messages} style={styles.hint} />}
    </Field>
  )
}

// Idempotent, as Base UI requires: it may normalize the same value more than once.
const toUpperCase = (value: string) => value.toUpperCase()

/**
 * A one-time code in character slots: one group of `length`, or two halves when `split` is set.
 * `characters` is what the slots accept (digits by default) and `uppercase` turns typed or pasted
 * letters into capitals; the schema still decides what is valid. `focusFirst` puts the caret in the
 * first slot when the page opens.
 */
export function CodeField({
  field,
  label,
  length,
  split = false,
  characters = 'numeric',
  uppercase = false,
  focusFirst = false
}: {
  field: FieldLike<string>
  label: string
  length: number
  split?: boolean
  characters?: 'numeric' | 'alphanumeric'
  uppercase?: boolean
  focusFirst?: boolean
}) {
  const m = useMessages()
  const messages = messagesOf(field)
  const half = length / 2
  const labelId = React.useId()
  // The first slot takes the ref, so a failed submit focuses the code.
  const slots = (from: number, to: number) =>
    Array.from({ length: to - from }, (_, index) => (
      <OTPFieldSlot
        key={from + index}
        ref={from + index === 0 ? field.props.ref : undefined}
        // oxlint-disable-next-line jsx-a11y/no-autofocus -- deliberate: opt-in, for pages whose only task is this code
        autoFocus={focusFirst && from + index === 0}
        style={styles.slot}
      />
    ))

  return (
    <Field name={field.props.name} invalid={field.errors !== null}>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <OTPField
        size='lg'
        style={styles.code}
        name={field.props.name}
        length={length}
        validationType={characters}
        normalizeValue={uppercase ? toUpperCase : undefined}
        value={field.input ?? ''}
        onValueChange={field.onChange}
        onFocus={field.props.onFocus}
        onBlur={field.props.onBlur}
        aria-labelledby={labelId}
        labels={{ slot: (position, total) => m.form_code_slot({ position, length: total }) }}
      >
        {split ? (
          <>
            <OTPFieldGroup style={styles.group}>{slots(0, half)}</OTPFieldGroup>
            <OTPFieldSeparator />
            <OTPFieldGroup style={styles.group}>{slots(half, length)}</OTPFieldGroup>
          </>
        ) : (
          <OTPFieldGroup style={styles.group}>{slots(0, length)}</OTPFieldGroup>
        )}
      </OTPField>
      {messages.length > 0 && <FieldError errors={messages} style={styles.hint} />}
    </Field>
  )
}
