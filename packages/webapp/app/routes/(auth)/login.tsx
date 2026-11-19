import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { SocialButtons } from '#/components/social-buttons'
import { formDefaults, submitWith, useAppForm } from '#/libraries/form'
import { loginSchema } from '#/schemas/login.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  staticData: { pageTitle: 'Sign in' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useAppForm({
    ...formDefaults,
    defaultValues: { email: '', password: '', captcha: false },
    validators: { onDynamic: loginSchema },
    // Demo only: there is no sign-in endpoint yet, so a valid form continues to the two-factor step.
    onSubmit: () => void navigate({ to: '/mfa' })
  })

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Sign in</h1>
        <p {...stylex.props(styles.subtitle)}>Use the account you registered with.</p>
      </div>

      <div {...stylex.props(styles.form)}>
        <SocialButtons />
      </div>

      <Form noValidate style={styles.form} onSubmit={submitWith(form)}>
        <div {...stylex.props(styles.fields)}>
          <form.AppField name='email'>
            {(field) => (
              <field.TextField label='Email address' inputMode='email' autoComplete='email' />
            )}
          </form.AppField>
          <form.AppField name='password'>
            {(field) => <field.PasswordField label='Password' autoComplete='current-password' />}
          </form.AppField>
          <form.AppField name='captcha'>{(field) => <field.CaptchaField />}</form.AppField>
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
