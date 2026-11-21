import { Field, handleSubmit, useForm } from '@formisch/react'
import { ArrowLeft } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Form } from 'uilibs/base/form'
import { Icon } from 'uilibs/extra/icon'
import { CheckboxField, CodeField } from '#/components/form-fields'
import { twoFactorSchema } from '#/schemas/auth.schema'
import { styles } from '#/styles/pages/auth.stylex'

export const Route = createFileRoute('/(auth)/two-factor')({
  component: RouteComponent,
  staticData: { pageTitle: 'Two-factor authentication' }
})

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm({ schema: twoFactorSchema, initialInput: { code: '', trust: false } })
  // Demo only: there is no verification endpoint yet, so a valid code opens the dashboard sample.
  const submit = handleSubmit(form, () => void navigate({ to: '/dashboard' }))

  return (
    <>
      <div {...stylex.props(styles.heading)}>
        <h1 {...stylex.props(styles.title)}>Two-factor authentication</h1>
        <p {...stylex.props(styles.subtitle)}>
          Open your authenticator app and enter the 6-digit code.
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
          {(field) => <CodeField field={field} label='Authentication code' length={6} focusFirst />}
        </Field>
        <Field of={form} path={['trust']}>
          {(field) => <CheckboxField field={field} label='Trust this device for 30 days' />}
        </Field>
        <Button type='submit' size='lg' style={styles.submit}>
          Verify
        </Button>
      </Form>

      <div {...stylex.props(styles.links)}>
        {/* Placeholder: recovery codes need the backend. */}
        <button type='button' {...stylex.props(styles.link, styles.linkButton)}>
          Use a recovery code
        </button>
        <Link to='/login' {...stylex.props(styles.link, styles.backLink, stylex.defaultMarker())}>
          <span {...stylex.props(styles.backIcon)}>
            <Icon svg={ArrowLeft} size={14} />
          </span>
          Back to sign in
        </Link>
      </div>
    </>
  )
}
