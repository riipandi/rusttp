import { expect, test } from '../../fixtures/test.ts'

test.describe('admin', () => {
  test('shows the navigation beside the overview', async ({ admin, isMobile }) => {
    await admin.open()

    await expect(admin.page).toHaveTitle('Overview - Rusttp')
    await expect(admin.heading()).toBeVisible()
    // Below the compact breakpoint the same `Admin` navigation lives in the top bar's drawer.
    if (isMobile) await admin.page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(admin.sidebar().getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })
})

test.describe('admin sidebar', () => {
  test.skip(({ isMobile }) => isMobile, 'Below the compact breakpoint the top bar replaces it')

  test('stays collapsed after a reload', async ({ admin }) => {
    await admin.open()
    await admin.collapseButton().click()
    await admin.page.reload()

    await expect(admin.expandButton()).toBeVisible()
    await expect(admin.sidebar().getByRole('link', { name: 'Overview' })).toHaveText('')
  })

  test('stays expanded after expanding and reloading', async ({ admin }) => {
    await admin.open()
    await admin.collapseButton().click()
    await admin.page.reload()
    await admin.expandButton().click()
    await admin.page.reload()

    await expect(admin.collapseButton()).toBeVisible()
    await expect(admin.sidebar().getByRole('link', { name: 'Overview' })).toHaveText('Overview')
  })

  test('opens expanded when the stored value is unknown', async ({ admin }) => {
    await admin.storeCollapse('folded')
    await admin.open()

    await expect(admin.collapseButton()).toBeVisible()
  })
})
