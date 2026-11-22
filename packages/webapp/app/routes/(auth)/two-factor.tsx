import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { CheckboxField, CodeField } from '#/components/form-fields'
import { PageTitle } from '#/components/page-title'
import { getMessages, useMessages } from '#/libraries/messages'
import { notWired } from '#/libraries/not-wired'
import { useRevalidateOnLocale } from '#/libraries/use-revalidate-on-locale'
import { twoFactorSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/two-factor')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_auth_two_factor() }
})

function RouteComponent() {
  const m = useMessages()
  const navigate = useNavigate()
  const form = useForm({ schema: twoFactorSchema, initialInput: { code: '', trust: false } })
  useRevalidateOnLocale(form)
  // Demo only: there is no verification endpoint yet, so a valid code opens the dashboard sample.
  const submit = handleSubmit(form, () => void navigate({ to: '/dashboard' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <PageTitle>{m.page_auth_two_factor()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_two_factor_subtitle()}</p>
      </div>

      <Form
        noValidate
        style={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Field of={form} path={['code']}>
          {(field) => (
            <CodeField field={field} label={m.auth_two_factor_code()} length={6} focusFirst />
          )}
        </Field>
        <Field of={form} path={['trust']}>
          {(field) => <CheckboxField field={field} label={m.auth_two_factor_trust()} />}
        </Field>
        <Button type='submit' size='lg' style={styles.submit}>
          {m.auth_two_factor_submit()}
        </Button>
      </Form>

      <div {...stylex.props(styles.links)}>
        {/* Placeholder: recovery codes need the backend. */}
        <button
          type='button'
          onClick={notWired('Use a recovery code')}
          {...stylex.props(styles.link, styles.linkButton)}
        >
          {m.auth_two_factor_recovery()}
        </button>
        <Link to='/login' {...stylex.props(styles.link, styles.backLink, stylex.defaultMarker())}>
          <span {...stylex.props(styles.backIcon)}>
            <Icon svg={ArrowLeft} size={14} />
          </span>
          {m.auth_back_to_sign_in()}
        </Link>
      </div>
    </>
  )
}
