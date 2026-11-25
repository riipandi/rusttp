import { Field, handleSubmit, useForm } from '@formisch/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link as RouterLink, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Link } from 'uilibs/extra/link'
import { Stack } from 'uilibs/extra/stack'
import { CaptchaField, PasswordField, TextField } from '#/components/form-fields'
import { MessageSlot, slotMarker } from '#/components/message-slot'
import { PageTitle } from '#/components/page-title'
import { SocialButtons } from '#/components/social-buttons'
import { getMessages, useMessages } from '#/libraries/messages'
import { useRevalidateOnLocale } from '#/libraries/use-revalidate-on-locale'
import { signupSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_auth_signup() }
})

function RouteComponent() {
  const m = useMessages()
  const navigate = useNavigate()
  const form = useForm({
    schema: signupSchema,
    initialInput: { firstName: '', lastName: '', email: '', password: '', captcha: false }
  })
  useRevalidateOnLocale(form)
  // Demo only: there is no sign-up endpoint yet, so a valid form continues to email verification.
  const submit = handleSubmit(form, () => void navigate({ to: '/verify-email' }))

  return (
    <>
      <Stack gap={2}>
        <PageTitle>{m.auth_signup_title()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_signup_subtitle()}</p>
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
        </Stack>
        <Button type='submit' size='large' style={styles.submit}>
          {m.auth_signup_submit()}
        </Button>
        <p {...stylex.props(styles.fine)}>{m.auth_signup_terms()}</p>
      </Form>

      <p {...stylex.props(styles.switch)}>
        <MessageSlot message={m.auth_signup_have_account({ link: slotMarker('link') })} name='link'>
          <Link render={<RouterLink to='/login' />} color='neutral' style={styles.linkStrong}>
            {m.auth_signup_sign_in()}
          </Link>
        </MessageSlot>
      </p>
    </>
  )
}
