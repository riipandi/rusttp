import { Field, handleSubmit, useForm } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { CaptchaField, PasswordField, TextField } from '#/components/form-fields'
import { SocialButtons } from '#/components/social-buttons'
import { signupSchema } from '#/schemas/signup.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
  staticData: { pageTitle: 'Create account' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm({
    schema: signupSchema,
    initialInput: { firstName: '', lastName: '', email: '', password: '', captcha: false }
  })
  // Demo only: there is no sign-up endpoint yet, so a valid form continues to email verification.
  const submit = handleSubmit(form, () => void navigate({ to: '/verify-email' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Create an account</h1>
        <p {...stylex.props(styles.subtitle)}>It takes a minute. We will verify your email next.</p>
      </div>

      <div {...stylex.props(styles.form)}>
        <SocialButtons />
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
          <div {...stylex.props(styles.nameRow)}>
            <Field of={form} path={['firstName']}>
              {(field) => <TextField field={field} label='First name' autoComplete='given-name' />}
            </Field>
            <Field of={form} path={['lastName']}>
              {(field) => <TextField field={field} label='Last name' autoComplete='family-name' />}
            </Field>
          </div>
          <Field of={form} path={['email']}>
            {(field) => (
              <TextField
                field={field}
                label='Email address'
                inputMode='email'
                autoComplete='email'
              />
            )}
          </Field>
          <Field of={form} path={['password']}>
            {(field) => (
              <PasswordField field={field} label='Password' autoComplete='new-password' />
            )}
          </Field>
          <Field of={form} path={['captcha']}>
            {(field) => <CaptchaField field={field} />}
          </Field>
        </div>
        <Button type='submit' size='lg' style={styles.submit}>
          Create account
        </Button>
        <p {...stylex.props(styles.fine)}>
          By creating an account you agree to the terms of service and the privacy policy.
        </p>
      </Form>

      <p {...stylex.props(styles.switch)}>
        Already have an account?{' '}
        <Link to='/login' {...stylex.props(styles.linkStrong)}>
          Sign in
        </Link>
      </p>
    </>
  )
}
