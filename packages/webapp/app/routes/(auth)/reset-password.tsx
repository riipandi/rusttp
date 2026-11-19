import { CircleAlert } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { StatusIcon } from '#/components/status-icon'
import { formDefaults, submitWith, useAppForm } from '#/libraries/form'
import { resetPasswordSchema, resetSearchSchema } from '#/schemas/reset-password.schema'
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
  const form = useAppForm({
    ...formDefaults,
    defaultValues: { token, password: '', confirm: '' },
    validators: { onDynamic: resetPasswordSchema },
    // Demo only: there is no reset endpoint yet, so a valid form returns to sign in. The token travels
    // with the new password in the submitted values.
    onSubmit: () => void navigate({ to: '/login' })
  })

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Choose a new password</h1>
        <p {...stylex.props(styles.subtitle)}>
          Pick one you have not used here before. You will sign in with it next.
        </p>
      </div>

      <Form noValidate style={styles.form} onSubmit={submitWith(form)}>
        <div {...stylex.props(styles.fields)}>
          <form.AppField name='password'>
            {(field) => (
              <field.PasswordField
                label='New password'
                description='At least 12 characters.'
                autoComplete='new-password'
              />
            )}
          </form.AppField>
          <form.AppField name='confirm'>
            {(field) => (
              <field.PasswordField label='Confirm password' autoComplete='new-password' />
            )}
          </form.AppField>
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
          It may have expired or already been used. Request a new one and we will email it to you.
        </p>
      </div>

      <LinkButton render={<Link to='/forgot-password' />} size='lg'>
        Request a new link
      </LinkButton>
    </>
  )
}
