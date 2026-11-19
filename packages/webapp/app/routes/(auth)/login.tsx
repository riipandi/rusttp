import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Field, FieldLabel } from 'uilibs/base/field'
import { Form } from 'uilibs/base/form'
import { Input } from 'uilibs/base/input'
import { InputPassword } from 'uilibs/extra/input-password'
import { ThemeSwitcher } from 'uilibs/theme'
import { Logo } from '#/components/logo'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/login.stylex'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  staticData: { pageTitle: 'Sign in' }
})

function RouteComponent() {
  return (
    <div {...stylex.props(styles.split)}>
      <aside {...stylex.props(styles.panel)}>
        <Link to='/' {...stylex.props(layout.brand)}>
          <Logo />
          Rusttp
        </Link>
        <div>
          <p {...stylex.props(styles.panelTitle)}>One Rust binary, from server to screen.</p>
          <p {...stylex.props(styles.panelText)}>
            The server renders the document, the React app takes over, and both ship together.
          </p>
        </div>
      </aside>

      <main {...stylex.props(styles.formSide)}>
        <div {...stylex.props(styles.topRow)}>
          <Link to='/' {...stylex.props(layout.brand, styles.mobileBrand)}>
            <Logo />
            Rusttp
          </Link>
          <div {...stylex.props(styles.theme)}>
            <ThemeSwitcher />
          </div>
        </div>

        <div {...stylex.props(styles.formWrap)}>
          <div {...stylex.props(styles.heading)}>
            <h1 {...stylex.props(styles.title)}>Sign in</h1>
            <p {...stylex.props(styles.subtitle)}>Use the account you registered with.</p>
          </div>

          <Form
            style={styles.form}
            // Demo only: there is no sign-in endpoint yet.
            onSubmit={(event) => event.preventDefault()}
          >
            <div {...stylex.props(styles.fields)}>
              <Field>
                <FieldLabel htmlFor='login-email'>Email</FieldLabel>
                <Input
                  id='login-email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  placeholder='robert.langdon@example.com'
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='login-password'>Password</FieldLabel>
                <InputPassword
                  id='login-password'
                  name='password'
                  autoComplete='current-password'
                  required
                />
              </Field>
            </div>
            <Button type='submit' size='lg' style={styles.submit}>
              Sign in
            </Button>
          </Form>

          <Button
            variant='ghost'
            size='sm'
            nativeButton={false}
            render={<Link to='/' />}
            style={styles.back}
          >
            Back to home
          </Button>
        </div>
      </main>
    </div>
  )
}
