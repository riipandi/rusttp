import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft, CircleAlert } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link as RouterLink, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { Link } from 'uilibs/extra/link'
import { Stack } from 'uilibs/extra/stack'
import { CodeField } from '#/components/form-fields'
import { PageTitle } from '#/components/page-title'
import { StatusIcon } from '#/components/status-icon'
import { getMessages, useMessages } from '#/libraries/messages'
import { useRevalidateOnLocale } from '#/libraries/use-revalidate-on-locale'
import { deviceSchema, deviceSearchSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/device')({
  // The device shows `/device?token=...`; without a token the search fails validation and the route
  // renders `InvalidLink` instead of the form.
  component: RouteComponent,
  errorComponent: InvalidLink,
  validateSearch: deviceSearchSchema,
  staticData: { pageTitle: () => getMessages().page_auth_device() }
})

function RouteComponent() {
  const m = useMessages()
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const form = useForm({ schema: deviceSchema, initialInput: { token, code: '' } })
  useRevalidateOnLocale(form)
  // Demo only: there is no device-authorization endpoint yet, so a valid code opens the dashboard sample.
  const submit = handleSubmit(form, () => void navigate({ to: '/dashboard' }))

  return (
    <>
      <Stack gap={2}>
        <PageTitle>{m.auth_device_title()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_device_subtitle()}</p>
      </Stack>

      <Form
        noValidate
        style={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Field of={form} path={['code']}>
          {(field) => (
            <CodeField
              field={field}
              label={m.auth_device_code()}
              length={8}
              split
              characters='alphanumeric'
              uppercase
              focusFirst
            />
          )}
        </Field>
        <Button type='submit' size='large' style={styles.submit}>
          {m.auth_device_submit()}
        </Button>
        <p {...stylex.props(styles.fine)}>{m.auth_device_warning()}</p>
      </Form>
    </>
  )
}

function InvalidLink() {
  const m = useMessages()
  return (
    <>
      <Stack gap={2}>
        <StatusIcon svg={CircleAlert} color='critical' />
        <PageTitle>{m.auth_device_invalid_title()}</PageTitle>
        <p {...stylex.props(styles.subtitle)}>{m.auth_device_invalid_subtitle()}</p>
      </Stack>

      <Link
        render={<RouterLink to='/login' />}
        color='neutral'
        style={[styles.link, styles.backLink, stylex.defaultMarker()]}
      >
        <span {...stylex.props(styles.backIcon)}>
          <Icon svg={ArrowLeft} size={14} />
        </span>
        {m.auth_back_to_sign_in()}
      </Link>
    </>
  )
}
