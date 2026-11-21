import { Field, handleSubmit, useForm } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { CaptchaField, PasswordField, TextField } from '#/components/form-fields'
import { SocialButtons } from '#/components/social-buttons'
import { loginSchema } from '#/schemas/login.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  staticData: { pageTitle: 'Sign in' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm({
    schema: loginSchema,
    initialInput: { email: '', password: '', captcha: false }
  })
  // Demo only: there is no sign-in endpoint yet, so a valid form continues to the two-factor step.
  const submit = handleSubmit(form, () => void navigate({ to: '/two-factor' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Sign in</h1>
        <p {...stylex.props(styles.subtitle)}>Use the account you registered with.</p>
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
              <PasswordField field={field} label='Password' autoComplete='current-password' />
            )}
          </Field>
          <Field of={form} path={['captcha']}>
            {(field) => <CaptchaField field={field} />}
          </Field>
        </div>
        <Button type='submit' size='lg' style={styles.submit}>
          Sign in
        </Button>
      </Form>

      <div {...stylex.props(styles.links)}>
        <Link to='/signup' {...stylex.props(styles.link)}>
          Create an account
        </Link>
        <Link to='/forgot-password' {...stylex.props(styles.link)}>
          Forgot password?
        </Link>
      </div>
    </>
  )
}
