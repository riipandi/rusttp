import { Field, handleSubmit, useForm } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { CaptchaField, PasswordField, TextField } from '#/components/form-fields'
import { SocialButtons } from '#/components/social-buttons'
import { m } from '#/paraglide/messages'
import { signupSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
  staticData: { pageTitle: m.page_auth_signup }
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
        <h1 {...stylex.props(styles.title)}>{m.auth_signup_title()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.auth_signup_subtitle()}</p>
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
              {(field) => (
                <TextField
                  field={field}
                  label={m.auth_signup_first_name()}
                  autoComplete='given-name'
                />
              )}
            </Field>
            <Field of={form} path={['lastName']}>
              {(field) => (
                <TextField
                  field={field}
                  label={m.auth_signup_last_name()}
                  autoComplete='family-name'
                />
              )}
            </Field>
          </div>
          <Field of={form} path={['email']}>
            {(field) => (
              <TextField
                field={field}
                label={m.auth_email_label()}
                inputMode='email'
                autoComplete='email'
              />
            )}
          </Field>
          <Field of={form} path={['password']}>
            {(field) => (
              <PasswordField
                field={field}
                label={m.auth_password_label()}
                autoComplete='new-password'
              />
            )}
          </Field>
          <Field of={form} path={['captcha']}>
            {(field) => <CaptchaField field={field} />}
          </Field>
        </div>
        <Button type='submit' size='lg' style={styles.submit}>
          {m.auth_signup_submit()}
        </Button>
        <p {...stylex.props(styles.fine)}>{m.auth_signup_terms()}</p>
      </Form>

      <p {...stylex.props(styles.switch)}>
        {m.auth_signup_have_account()}{' '}
        <Link to='/login' {...stylex.props(styles.linkStrong)}>
          {m.auth_signup_sign_in()}
        </Link>
      </p>
    </>
  )
}
