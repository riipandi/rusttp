import { expect, test } from '../../fixtures/test.ts'

test.describe('home', () => {
  test('renders the landing page', async ({ home }) => {
    await home.open()

    await expect(home.page).toHaveTitle('Home - Rusttp')
    await expect(home.heading()).toBeVisible()
  })
})
