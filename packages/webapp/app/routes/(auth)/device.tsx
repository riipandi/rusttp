import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { CodeField } from '#/components/form-fields'
import { deviceSchema } from '#/schemas/device.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/device')({
  component: RouteComponent,
  staticData: { pageTitle: 'Device login' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm({ schema: deviceSchema, initialInput: { code: '' } })
  // Demo only: there is no device-authorization endpoint yet, so a valid code opens the dashboard sample.
  const submit = handleSubmit(form, () => void navigate({ to: '/dashboard' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Sign in on a device</h1>
        <p {...stylex.props(styles.subtitle)}>
          Enter the 8-character code shown on the device you want to link to your account.
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
        <Field of={form} path={['code']}>
          {(field) => <CodeField field={field} label='Device code' length={8} split />}
        </Field>
        <Button type='submit' size='lg' style={styles.submit}>
          Continue
        </Button>
        <p {...stylex.props(styles.fine)}>
          Only continue if you started this sign-in yourself. Anyone with the code can link a
          device.
        </p>
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
