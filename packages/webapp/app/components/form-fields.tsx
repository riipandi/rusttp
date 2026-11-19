import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Checkbox } from 'uilibs/base/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from 'uilibs/base/field'
import { Input } from 'uilibs/base/input'
import { OTPField, OTPFieldGroup, OTPFieldSeparator, OTPFieldSlot } from 'uilibs/base/otp-field'
import { InputPassword } from 'uilibs/extra/input-password'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontLineHeight, fontSize, radius, unit } from 'uilibs/styles/tokens.stylex'
import { useFieldContext } from '#/libraries/form-context'

const styles = stylex.create({
  // Visually hidden but still the control's accessible name: the placeholder is the visible label.
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0
  },
  // Hints and messages sit a little closer to their control than to the next one, and line up with
  // the text inside it rather than with its border.
  hint: {
    marginBlockStart: `calc(-1 * ${unit.x1})`,
    paddingInline: unit.x4,
    // The same size for a hint and a message, so one replaces the other without the line shifting.
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2
  },
  warning: {
    display: 'block',
    margin: 0,
    color: colors.foregroundWarning,
    fontSize: fontSize.caption1
  },
  // The code fills the form column: the slots share its width and stand taller than a text field.
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
    minHeight: unit.x10,
    paddingBlock: unit.x2,
    paddingInline: unit.x4,
    backgroundColor: colors.backgroundPageFaded,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderControl,
    borderRadius: radius.medium
  },
  captchaInvalid: {
    borderColor: colors.borderCritical
  },
  captchaBadge: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption2,
    textAlign: 'end'
  }
})

const messageOf = (error: unknown): string | undefined => {
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return typeof error.message === 'string' ? error.message : undefined
  }
  return undefined
}

/** The messages a Standard Schema validator (Valibot) left on the field, shaped for `FieldError`. */
function useMessages<T>() {
  const field = useFieldContext<T>()
  // One message at a time: the first rule that failed, the next one shows once it is fixed.
  const messages = field.state.meta.errors
    .slice(0, 1)
    .map((error: unknown) => ({ message: messageOf(error) }))
  return { field, messages, invalid: messages.some((m) => m.message) }
}

interface TextFieldProps {
  /** The accessible name; shown as the placeholder, not as a visible label. */
  label: string
  description?: string
  autoComplete?: string
  /** Not `type='email'`: native type validity would block the submit before Valibot can speak. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}

export function TextField({ label, description, autoComplete, inputMode }: TextFieldProps) {
  const { field, messages, invalid } = useMessages<string>()

  return (
    <Field name={field.name} invalid={invalid}>
      <FieldLabel htmlFor={field.name} style={styles.srOnly}>
        {label}
      </FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        size='lg'
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={label}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
      />
      {invalid ? (
        <FieldError errors={messages} style={styles.hint} />
      ) : (
        description && <FieldDescription style={styles.hint}>{description}</FieldDescription>
      )}
    </Field>
  )
}

export function PasswordField({
  label,
  description,
  autoComplete
}: Omit<TextFieldProps, 'inputMode'>) {
  const { field, messages, invalid } = useMessages<string>()
  const [capsLock, setCapsLock] = React.useState(false)

  return (
    <Field name={field.name} invalid={invalid}>
      <FieldLabel htmlFor={field.name} style={styles.srOnly}>
        {label}
      </FieldLabel>
      <InputPassword
        id={field.name}
        name={field.name}
        size='lg'
        autoComplete={autoComplete}
        placeholder={label}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={() => {
          field.handleBlur()
          setCapsLock(false)
        }}
        onKeyDown={(event) => setCapsLock(event.getModifierState('CapsLock'))}
        onKeyUp={(event) => setCapsLock(event.getModifierState('CapsLock'))}
      />
      {invalid ? (
        <FieldError errors={messages} style={styles.hint} />
      ) : (
        description && <FieldDescription style={styles.hint}>{description}</FieldDescription>
      )}
      {capsLock && <output {...stylex.props(styles.warning)}>Caps Lock is on.</output>}
    </Field>
  )
}

export function CheckboxField({ label }: { label: string }) {
  const { field } = useMessages<boolean>()
  const id = React.useId()

  return (
    <label htmlFor={id} {...stylex.props(styles.check)}>
      <Checkbox
        id={id}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
      {label}
    </label>
  )
}

// Placeholder for a captcha widget (Turnstile, hCaptcha, reCAPTCHA): a checkbox challenge with
// nothing verifying it. Swap the body for the provider's widget; the schema already requires it.
export function CaptchaField() {
  const { field, messages, invalid } = useMessages<boolean>()
  const id = React.useId()

  return (
    <Field name={field.name} invalid={invalid}>
      <div {...stylex.props(styles.captcha, invalid && styles.captchaInvalid)}>
        <label htmlFor={id} {...stylex.props(styles.check)}>
          <Checkbox
            id={id}
            name={field.name}
            checked={field.state.value}
            onCheckedChange={(checked) => field.handleChange(checked)}
          />
          I am not a robot
        </label>
        <span {...stylex.props(styles.captchaBadge)}>Captcha placeholder</span>
      </div>
      {invalid && <FieldError errors={messages} style={styles.hint} />}
    </Field>
  )
}

/** A one-time code in character slots: one group of `length`, or two halves when `split` is set. */
export function CodeField({
  label,
  length,
  split = false
}: {
  label: string
  length: number
  split?: boolean
}) {
  const { field, messages, invalid } = useMessages<string>()
  const half = length / 2
  const slots = (from: number, to: number) =>
    Array.from({ length: to - from }, (_, index) => (
      <OTPFieldSlot key={from + index} style={styles.slot} />
    ))

  return (
    <Field name={field.name} invalid={invalid}>
      <OTPField
        size='lg'
        style={styles.code}
        name={field.name}
        length={length}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        aria-label={label}
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
      {invalid && <FieldError errors={messages} style={styles.hint} />}
    </Field>
  )
}
