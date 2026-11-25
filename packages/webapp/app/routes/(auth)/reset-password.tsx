import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft, CircleAlert } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, useNavigate, Link as RouterLink } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { Link } from 'uilibs/extra/link'
import { PasswordField } from '#/components/form-fields'
import { PageTitle } from '#/components/page-title'
import { StatusIcon } from '#/components/status-icon'
import { getMessages, useMessages } from '#/libraries/messages'
import { useRevalidateOnLocale } from '#/libraries/use-revalidate-on-locale'
import { resetPasswordSchema, resetSearchSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/reset-password')({
  // The emailed link is `/reset-password?token=...`; without a token the search fails validation and
  // the route renders `InvalidLink` instead of the form.
  component: RouteComponent,
  errorComponent: InvalidLink,
  validateSearch: resetSearchSchema,
  staticData: { pageTitle: () => getMessages().page_auth_reset_password() }
})

function RouteComponent() {
  const m = useMessages()
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const form = useForm({
    schema: resetPasswordSchema,
    initialInput: { token, password: '', confirm: '' }
  })
  useRevalidateOnLocale(form)
  // Demo only: there is no reset endpoint yet, so a valid form returns to sign in. The token travels
  // with the new password in the submitted values.
  const submit = handleSubmit(form, () => void navigate({ to: '/login' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <PageTitle>{m.auth_reset_title()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_reset_subtitle()}</p>
      </div>

      <Form
        noValidate
        style={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div {...stylex.props(styles.fields)}>
          <Field of={form} path={['password']}>
            {(field) => (
              <PasswordField
                field={field}
                label={m.auth_reset_new_password()}
                autoComplete='new-password'
              />
            )}
          </Field>
          <Field of={form} path={['confirm']}>
            {(field) => (
              <PasswordField
                field={field}
                label={m.auth_reset_confirm_password()}
                autoComplete='new-password'
              />
            )}
          </Field>
        </div>
        <Button type='submit' size='large' style={styles.submit}>
          {m.auth_reset_submit()}
        </Button>
      </Form>
    </>
  )
}

function InvalidLink() {
  const m = useMessages()
  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <StatusIcon svg={CircleAlert} color='critical' />
        <PageTitle>{m.auth_reset_invalid_title()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_reset_invalid_description()}</p>
      </div>

      <LinkButton render={<RouterLink to='/forgot-password' />} size='large'>
        {m.auth_reset_invalid_action()}
      </LinkButton>

      <Link
        render={<RouterLink to='/login' />}
        color='neutral'
        style={[styles.link, styles.backLink, stylex.defaultMarker()]}
      >
        <span {...stylex.props(styles.backIcon)}>
          <Icon svg={ArrowLeft} size={14} />
        </span>
        {m.auth_back_to_sign_in()}
      </Link>
    </>
  )
}
