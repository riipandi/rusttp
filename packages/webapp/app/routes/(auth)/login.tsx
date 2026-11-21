import { Field, handleSubmit, useForm } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { CaptchaField, PasswordField, TextField } from '#/components/form-fields'
import { SocialButtons } from '#/components/social-buttons'
import { getMessages, useMessages } from '#/libraries/messages'
import { useRevalidateOnLocale } from '#/libraries/use-revalidate-on-locale'
import { loginSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_auth_login() }
})

function RouteComponent() {
  const m = useMessages()
  const navigate = useNavigate()
  const form = useForm({
    schema: loginSchema,
    initialInput: { email: '', password: '', captcha: false }
  })
  useRevalidateOnLocale(form)
  // Demo only: there is no sign-in endpoint yet, so a valid form continues to the two-factor step.
  const submit = handleSubmit(form, () => void navigate({ to: '/two-factor' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>{m.page_auth_login()}</h1>
        <p {...stylex.props(styles.subtitle)}>{m.auth_login_subtitle()}</p>
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
                autoComplete='current-password'
              />
            )}
          </Field>
          <Field of={form} path={['captcha']}>
            {(field) => <CaptchaField field={field} />}
          </Field>
        </div>
        <Button type='submit' size='lg' style={styles.submit}>
          {m.auth_login_submit()}
        </Button>
      </Form>

      <div {...stylex.props(styles.links)}>
        <Link to='/signup' {...stylex.props(styles.link)}>
          {m.auth_login_create_account()}
        </Link>
        <Link to='/forgot-password' {...stylex.props(styles.link)}>
          {m.auth_login_forgot()}
        </Link>
      </div>
    </>
  )
}
