import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { SocialButtons } from '#/components/social-buttons'
import { formDefaults, submitWith, useAppForm } from '#/libraries/form'
import { signupSchema } from '#/schemas/signup.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
  staticData: { pageTitle: 'Create account' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useAppForm({
    ...formDefaults,
    defaultValues: { firstName: '', lastName: '', email: '', password: '', captcha: false },
    validators: { onDynamic: signupSchema },
    // Demo only: there is no sign-up endpoint yet, so a valid form continues to email verification.
    onSubmit: () => void navigate({ to: '/verify-email' })
  })

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Create an account</h1>
        <p {...stylex.props(styles.subtitle)}>It takes a minute. We will verify your email next.</p>
      </div>

      <div {...stylex.props(styles.form)}>
        <SocialButtons />
      </div>

      <Form noValidate style={styles.form} onSubmit={submitWith(form)}>
        <div {...stylex.props(styles.fields)}>
          <div {...stylex.props(styles.nameRow)}>
            <form.AppField name='firstName'>
              {(field) => <field.TextField label='First name' autoComplete='given-name' />}
            </form.AppField>
            <form.AppField name='lastName'>
              {(field) => <field.TextField label='Last name' autoComplete='family-name' />}
            </form.AppField>
          </div>
          <form.AppField name='email'>
            {(field) => (
              <field.TextField label='Email address' inputMode='email' autoComplete='email' />
            )}
          </form.AppField>
          <form.AppField name='password'>
            {(field) => (
              <field.PasswordField
                label='Password'
                description='At least 12 characters.'
                autoComplete='new-password'
              />
            )}
          </form.AppField>
          <form.AppField name='captcha'>{(field) => <field.CaptchaField />}</form.AppField>
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
