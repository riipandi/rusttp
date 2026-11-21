import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft } from '@keyline-icons/react'
import { CircleAlert } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { PasswordField } from '#/components/form-fields'
import { StatusIcon } from '#/components/status-icon'
import { resetPasswordSchema, resetSearchSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/reset-password')({
  // The emailed link is `/reset-password?token=...`; without a token the search fails validation and
  // the route renders `InvalidLink` instead of the form.
  component: RouteComponent,
  errorComponent: InvalidLink,
  validateSearch: resetSearchSchema,
  staticData: { pageTitle: 'Reset password' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const form = useForm({
    schema: resetPasswordSchema,
    initialInput: { token, password: '', confirm: '' }
  })
  // Demo only: there is no reset endpoint yet, so a valid form returns to sign in. The token travels
  // with the new password in the submitted values.
  const submit = handleSubmit(form, () => void navigate({ to: '/login' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Choose a new password</h1>
        <p {...stylex.props(styles.subtitle)}>
          Pick one you have not used here before. <br />
          You will sign in with it next.
        </p>
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
              <PasswordField field={field} label='New password' autoComplete='new-password' />
            )}
          </Field>
          <Field of={form} path={['confirm']}>
            {(field) => (
              <PasswordField field={field} label='Confirm password' autoComplete='new-password' />
            )}
          </Field>
        </div>
        <Button type='submit' size='lg' style={styles.submit}>
          Reset password
        </Button>
      </Form>
    </>
  )
}

function InvalidLink() {
  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <StatusIcon svg={CircleAlert} tone='critical' />
        <h1 {...stylex.props(styles.title)}>This reset link is not valid</h1>
        <p {...stylex.props(styles.subtitle)}>
          It may have expired or already been used. <br />
          Request a new one and we will email it to you.
        </p>
      </div>

      <LinkButton render={<Link to='/forgot-password' />} size='lg'>
        Request a new link
      </LinkButton>

      <Link to='/login' {...stylex.props(styles.link, styles.backLink, stylex.defaultMarker())}>
        <span {...stylex.props(styles.backIcon)}>
          <Icon svg={ArrowLeft} size={14} />
        </span>
        Back to sign in
      </Link>
    </>
  )
}
