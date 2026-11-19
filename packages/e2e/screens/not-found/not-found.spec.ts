import { expect, test } from '../../fixtures/test.ts'

test.describe('not found', () => {
  test('renders the catch-all page and links back home', async ({ notFound, home }) => {
    await notFound.open()

    await expect(notFound.heading()).toBeVisible()

    await notFound.homeLink().click()
    await expect(home.page).toHaveURL('/')
    await expect(home.heading()).toBeVisible()
  })
})
