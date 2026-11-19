import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { TextField } from '#/components/form-fields'
import { forgotPasswordSchema } from '#/schemas/forgot-password.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: RouteComponent,
  staticData: { pageTitle: 'Forgot password' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm({ schema: forgotPasswordSchema, initialInput: { email: '' } })
  // Demo only: there is no mailer wired in yet, so a valid form opens the reset page the emailed
  // link would, with a sample token (a spell, not a secret).
  const submit = handleSubmit(
    form,
    () => void navigate({ to: '/reset-password', search: { token: 'alohomora' } })
  )

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Forgot your password?</h1>
        <p {...stylex.props(styles.subtitle)}>
          Enter the email you registered with and we will send you a link to reset it.
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
        <Field of={form} path={['email']}>
          {(field) => (
            <TextField field={field} label='Email address' inputMode='email' autoComplete='email' />
          )}
        </Field>
        <Button type='submit' size='lg' style={styles.submit}>
          Send reset link
        </Button>
      </Form>

      <Link to='/login' {...stylex.props(styles.link, styles.backLink, stylex.defaultMarker())}>
        <span {...stylex.props(styles.backIcon)}>
          <Icon svg={ArrowLeft} size={14} />
        </span>
        Back to sign in
      </Link>
    </>
  )
}
