import { createFormHook, revalidateLogic } from '@tanstack/react-form'
import type * as React from 'react'
import {
  CaptchaField,
  CheckboxField,
  CodeField,
  PasswordField,
  TextField
} from '#/components/form-fields'
import { fieldContext, formContext } from '#/libraries/form-context'

/**
 * The app's form hook: TanStack Form for state, zod (a Standard Schema) for the rules, and the
 * `uilibs` fields, built on Base UI's Field, as its typed field components:
 *
 *     const form = useAppForm({ ...formDefaults, defaultValues, validators: { onDynamic: schema }, onSubmit })
 *     <form.AppField name='email'>{(field) => <field.TextField label='Email address' />}</form.AppField>
 */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, PasswordField, CheckboxField, CaptchaField, CodeField },
  formComponents: {}
})

// Validates on the first submit, then on every change, so a message disappears as soon as it is fixed.
export const formDefaults = {
  validationLogic: revalidateLogic(),
  onSubmitInvalid: () => {
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus()
    )
  }
}

/** The `onSubmit` for a Base UI `<Form noValidate>`: TanStack Form validates, not the browser. */
export const submitWith =
  (form: { handleSubmit: () => Promise<void> }) => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }
