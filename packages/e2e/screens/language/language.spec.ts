import { expect, test } from '../../fixtures/test.ts'
import { routes } from '../../utils/routes.ts'

async function switchToIndonesian(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Preferences' }).click()
  await page.getByRole('menuitem', { name: 'Language' }).click()
  await page.getByRole('menuitemradio', { name: 'Bahasa Indonesia' }).click()
}

test.describe('language change', () => {
  test('re-renders in place: typed input and an error survive, in the new language', async ({
    page
  }) => {
    await page.goto(routes.login)
    // An error on screen (an empty submit) and typed input in another field.
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByText('Enter your email address.')).toBeVisible()
    const password = page.getByLabel('Password', { exact: true })
    await password.fill('sangreal')
    await password.focus()

    await switchToIndonesian(page)

    await expect(page.getByRole('heading', { level: 1, name: 'Masuk' })).toBeVisible()
    // The same input node keeps its value and, once the menu closes, nothing resets the form.
    await expect(page.getByLabel('Kata sandi', { exact: true })).toHaveValue('sangreal')
    // The error that was showing is written again in the new language.
    await expect(page.getByText('Enter your email address.')).toHaveCount(0)
    await expect(page.getByText(/Masukkan alamat email/)).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'id')
  })

  test('a memoized component changes language too', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Below the compact breakpoint the sidebar is a drawer')
    await page.goto(routes.admin)
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible()
    await page
      .getByRole('button', { name: /^Account menu|Hermione/ })
      .first()
      .click()
    await page.getByRole('menuitem', { name: 'Language' }).click()
    await page.getByRole('menuitemradio', { name: 'Bahasa Indonesia' }).click()

    await expect(page.getByRole('link', { name: 'Pengguna' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ringkasan' })).toBeVisible()
  })

  test('the choice is remembered after a reload', async ({ page }) => {
    await page.goto(routes.login)
    await switchToIndonesian(page)
    await page.reload()

    await expect(page.getByRole('heading', { level: 1, name: 'Masuk' })).toBeVisible()
  })
})
