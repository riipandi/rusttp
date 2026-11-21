import { expect, test } from '../../fixtures/test.ts'

test.describe('admin', () => {
  test('shows the sidebar beside the overview', async ({ admin }) => {
    await admin.open()

    await expect(admin.page).toHaveTitle('Overview - Rusttp')
    await expect(admin.heading()).toBeVisible()
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

  test('keeps the logo a link to the overview in the rail', async ({ admin }) => {
    await admin.storeCollapse('collapsed')
    await admin.page.goto('/admin/users')

    await expect(admin.expandButton()).toBeVisible()
    await admin.logo().click()
    await expect(admin.page).toHaveURL(/\/admin$/)
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
