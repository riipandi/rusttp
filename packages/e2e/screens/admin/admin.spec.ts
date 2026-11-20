import { expect, test } from '../../fixtures/test.ts'

test.describe('admin', () => {
  test('shows the sidebar beside the overview', async ({ admin }) => {
    await admin.open()

    await expect(admin.page).toHaveTitle('Admin - Rusttp')
    await expect(admin.heading()).toBeVisible()
    await expect(admin.sidebar().getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })
})
