import { Field, handleSubmit, useForm } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link as RouterLink, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Link } from 'uilibs/extra/link'
import { Stack } from 'uilibs/extra/stack'
import { CaptchaField, PasswordField, TextField } from '#/components/form-fields'
import { PageTitle } from '#/components/page-title'
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
      <Stack gap={2}>
        <PageTitle>{m.page_auth_login()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_login_subtitle()}</p>
      </Stack>

      <Stack gap={5}>
        <SocialButtons />
      </Stack>

      <Form
        noValidate
        style={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Stack gap={5}>
          <Field of={form} path={['email']}>
            {(field) => (
              <TextField
                field={field}
                label={m.auth_email_label()}
                inputMode='email'
                autoComplete='username'
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
        </Stack>
        <Button type='submit' size='large' style={styles.submit}>
          {m.auth_login_submit()}
        </Button>
      </Form>

      <Stack
        direction='row'
        wrap
        align='center'
        justify='space-between'
        gap={2}
        style={styles.links}
      >
        <Link render={<RouterLink to='/signup' />} color='neutral' style={styles.link}>
          {m.auth_login_create_account()}
        </Link>
        <Link render={<RouterLink to='/forgot-password' />} color='neutral' style={styles.link}>
          {m.auth_login_forgot()}
        </Link>
      </Stack>
    </>
  )
}
