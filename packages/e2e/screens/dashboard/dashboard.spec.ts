import { expect, test } from '../../fixtures/test.ts'

test.describe('dashboard', () => {
  test('lists the recent loans', async ({ dashboard }) => {
    await dashboard.open()

    await expect(dashboard.page).toHaveTitle('Dashboard - Rusttp')
    await expect(dashboard.heading()).toBeVisible()
    await expect(dashboard.loanRow('Hermione Granger')).toContainText('Hogwarts: A History')
  })
})
