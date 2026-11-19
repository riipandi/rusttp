import { createFormHookContexts } from '@tanstack/react-form'

// Split from `form.ts` so the field components can read the context without importing the hook
// that registers them.
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
