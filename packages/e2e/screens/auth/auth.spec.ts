import { expect, test } from '../../fixtures/test.ts'
import { routes } from '../../utils/routes.ts'

const pages = [
  { path: routes.login, heading: 'Sign in' },
  { path: routes.signup, heading: 'Create an account' },
  { path: routes.forgotPassword, heading: 'Forgot your password?' },
  { path: routes.resetPassword, heading: 'Choose a new password' },
  { path: routes.verifyEmail, heading: 'Check your email' },
  { path: routes.emailVerified, heading: 'Email verified' },
  { path: routes.mfa, heading: 'Two-factor authentication' },
  { path: routes.device, heading: 'Sign in on a device' }
]

test.describe('auth pages', () => {
  for (const { path, heading } of pages) {
    test(`${path} renders its heading`, async ({ page }) => {
      await page.goto(path)

      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    })
  }

  test('the fields and the submit button of a form are one height', async ({ page }) => {
    await page.goto(routes.login)
    const submit = await page.getByRole('button', { name: 'Sign in', exact: true }).boundingBox()
    const email = await page.getByLabel('Email').boundingBox()
    // The password field is a group: the input sits inside its bordered box.
    const password = await page
      .getByLabel('Password', { exact: true })
      .locator('xpath=..')
      .boundingBox()

    expect(submit?.height).toBe(40)
    expect(email?.height).toBe(submit?.height)
    expect(password?.height).toBe(submit?.height)
  })

  test('the sign-in demo continues through two-factor to the dashboard', async ({ page }) => {
    await page.goto(routes.login)
    await page.getByLabel('Email').fill('robert.langdon@example.com')
    await page.getByLabel('Password', { exact: true }).fill('sangreal')
    await page.getByRole('checkbox', { name: /not a robot/i }).click()
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await expect(page).toHaveURL(routes.mfa)
    await page.getByRole('textbox').first().click()
    await page.keyboard.type('123456')
    await page.getByRole('button', { name: 'Verify' }).click()

    await expect(page).toHaveURL(routes.dashboard)
  })
  test('an empty sign-in shows a message for each field and focuses the first', async ({
    page
  }) => {
    await page.goto(routes.login)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await expect(page.getByText('Enter your email address.')).toBeVisible()
    await expect(page.getByText('Enter your password.')).toBeVisible()
    await expect(page.getByText('Confirm that you are not a robot.')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeFocused()
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('a message clears as soon as its field is fixed', async ({ page }) => {
    await page.goto(routes.login)
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByText('Enter a valid email address.')).toBeVisible()

    await page.getByLabel('Email').fill('robert.langdon@example.com')
    await expect(page.getByText('Enter a valid email address.')).toBeHidden()
  })

  test('signup asks for a longer password', async ({ page }) => {
    await page.goto(routes.signup)
    await page.getByLabel('First name').fill('Sophie')
    await page.getByLabel('Last name').fill('Neveu')
    await page.getByLabel('Email').fill('sophie.neveu@example.com')
    await page.getByLabel('Password', { exact: true }).fill('short')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Use at least 12 characters.')).toBeVisible()
  })

  test('a reset link without its token is rejected', async ({ page }) => {
    await page.goto(routes.resetPasswordWithoutToken)

    await expect(
      page.getByRole('heading', { name: 'This reset link is not valid', level: 1 })
    ).toBeVisible()
    await page.getByRole('link', { name: 'Request a new link' }).click()
    await expect(page).toHaveURL(routes.forgotPassword)
  })

  test('forgot password sends the user to a reset link with a token', async ({ page }) => {
    await page.goto(routes.forgotPassword)
    await page.getByLabel('Email').fill('robert.langdon@example.com')
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page).toHaveURL(routes.resetPassword)
  })

  test('reset password flags a mismatch', async ({ page }) => {
    await page.goto(routes.resetPassword)
    await page.getByLabel('New password').fill('correct horse battery')
    await page.getByLabel('Confirm password').fill('correct horse batter')
    await page.getByRole('button', { name: 'Reset password' }).click()

    await expect(page.getByText('The passwords do not match.')).toBeVisible()
  })

  test('a code of the wrong length is rejected', async ({ page }) => {
    await page.goto(routes.mfa)
    await page.getByRole('button', { name: 'Verify' }).click()

    await expect(page.getByText('Enter the 6-digit code.')).toBeVisible()
  })
})
