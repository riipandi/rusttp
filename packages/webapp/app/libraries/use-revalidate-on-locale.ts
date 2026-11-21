import { type FormSchema, type FormStore, getDeepErrors, validate } from '@formisch/react'
import { useSelector } from '@tanstack/react-store'
import * as React from 'react'
import { localeStore } from '#/libraries/locale.store'

/**
 * Valibot writes a rule's message into the form when the rule fails, so an error already on screen
 * would keep the language it was written in. On a language change a form that shows an error
 * validates again, which rewrites the text in the new language; the input, the focus, and the
 * fields that show no error stay as they are.
 */
export function useRevalidateOnLocale<TSchema extends FormSchema>(form: FormStore<TSchema>) {
  const locale = useSelector(localeStore)
  const shown = React.useRef(locale)
  React.useEffect(() => {
    if (shown.current === locale) return
    shown.current = locale
    if (getDeepErrors(form) !== null) void validate(form)
  }, [locale, form])
}
