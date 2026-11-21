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
    await admin.openReady()
    await admin.collapseButton().click()
    await admin.page.reload()

    await expect(admin.expandButton()).toBeVisible()
    // The rail keeps the label in the row, faded out, so the icon does not move while it animates.
    await expect(
      admin.sidebar().getByRole('link', { name: 'Overview' }).getByText('Overview')
    ).toHaveCSS('opacity', '0')
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

  test('folds to the rail on settings and restores the sidebar after', async ({ admin }) => {
    await admin.open()
    await admin.sidebar().getByRole('link', { name: 'Settings' }).click()
    await expect(admin.expandButton()).toBeVisible()

    await admin.sidebar().getByRole('link', { name: 'Users' }).click()
    await expect(admin.collapseButton()).toBeVisible()
    await expect
      .poll(() => admin.page.evaluate(() => localStorage.getItem('admin-sidebar')))
      .not.toBe('collapsed')
  })

  test('opens expanded when the stored value is unknown', async ({ admin }) => {
    await admin.storeCollapse('folded')
    await admin.open()

    await expect(admin.collapseButton()).toBeVisible()
  })
})

test.describe('admin command bar and hotkeys', () => {
  test.skip(({ isMobile }) => isMobile, 'No keyboard on a touch device; the bar opens from a key')

  test('Mod+K opens the command bar and runs a command', async ({ admin }) => {
    await admin.openReady()
    await expect(admin.commandTrigger()).toBeVisible()

    await admin.mod('k')
    await expect(admin.commandBar()).toBeVisible()
    await admin.page.keyboard.type('settings')
    await admin.page.keyboard.press('Enter')

    await expect(admin.page).toHaveURL(/\/admin\/settings/)
    await expect(admin.commandBar()).toHaveCount(0)
  })

  test('the sidebar trigger opens the bar, and Mod+K closes it again', async ({ admin }) => {
    await admin.openReady()
    await admin.commandTrigger().click()
    await expect(admin.commandBar()).toBeVisible()

    await admin.mod('k')
    await expect(admin.commandBar()).toHaveCount(0)
  })

  test('the command bar reaches the notifications page by name, a synonym, and G N', async ({
    admin
  }) => {
    await admin.openReady()
    await admin.mod('k')
    await admin.page.keyboard.type('alerts')
    await expect(admin.commandBar().getByRole('option')).toHaveCount(1)
    await expect(admin.commandBar().getByRole('option')).toContainText('Notifications')
    await admin.page.keyboard.press('Enter')
    await expect(admin.page).toHaveURL(/\/admin\/notifications$/)

    await admin.page.goto('/admin')
    await admin.commandTrigger().waitFor()
    await admin.page.keyboard.press('g')
    await admin.page.keyboard.press('n')
    await expect(admin.page).toHaveURL(/\/admin\/notifications$/)
  })

  test('closing the command bar does not put focus back on its trigger', async ({ admin }) => {
    await admin.openReady()
    await admin.commandTrigger().click()
    await expect(admin.commandBar()).toBeVisible()
    await admin.page.keyboard.press('Escape')
    await expect(admin.commandBar()).toHaveCount(0)

    await expect(admin.commandTrigger()).not.toBeFocused()
  })

  test('the command bar finds a settings page and an account link', async ({ admin }) => {
    await admin.openReady()
    await admin.mod('k')
    await admin.page.keyboard.type('sessions')
    await expect(admin.commandBar().getByRole('option')).toHaveText(['Settings → Sessions'])
    await admin.page.keyboard.press('Enter')
    await expect(admin.page).toHaveURL(/\/admin\/settings\/sessions$/)

    await admin.mod('k')
    await admin.page.keyboard.type('security')
    await admin.page.keyboard.press('Enter')
    await expect(admin.page).toHaveURL(/\/admin\/security$/)
  })

  test('Mod+B expands and collapses the sidebar', async ({ admin }) => {
    await admin.openReady()
    await expect(admin.collapseButton()).toBeVisible()

    await admin.mod('b')
    await expect(admin.expandButton()).toBeVisible()
    await admin.mod('b')
    await expect(admin.collapseButton()).toBeVisible()
  })

  test('G then U goes to Users', async ({ admin }) => {
    await admin.openReady()
    await admin.page.keyboard.press('g')
    await admin.page.keyboard.press('u')

    await expect(admin.page).toHaveURL(/\/admin\/users$/)
  })

  test('the open command bar suspends the page hotkeys', async ({ admin }) => {
    await admin.openReady()
    await admin.mod('k')
    await expect(admin.commandBar()).toBeVisible()

    // Neither the sidebar shortcut nor a sequence reaches the page behind the bar. The page is
    // hidden from the accessibility tree while the dialog is open, so check it once it closes.
    await admin.mod('b')
    await admin.page.keyboard.press('g')
    await admin.page.keyboard.press('u')
    await admin.page.keyboard.press('Escape')
    await expect(admin.commandBar()).toHaveCount(0)
    await expect(admin.collapseButton()).toBeVisible()
    await expect(admin.page).toHaveURL(/\/admin$/)

    // And they are back once it has closed.
    await admin.mod('b')
    await expect(admin.expandButton()).toBeVisible()
  })

  test('a shortcut can be rebound, it survives a reload, and a taken one is refused', async ({
    admin
  }) => {
    await admin.openReady()
    await admin.mod('/')
    const change = (name: string) =>
      admin.page.getByRole('button', { name: `Change ${name} shortcut` })

    // G S -> G X
    await change('Go to Settings').click()
    await admin.page.keyboard.press('g')
    await admin.page.keyboard.press('x')
    await admin.page.keyboard.press('Enter')
    await expect(
      admin.page.getByRole('button', { name: 'Reset Go to Settings shortcut' })
    ).toBeVisible()

    // G O belongs to Overview: the recorder refuses it and names the owner.
    await change('Go to Users').click()
    await admin.page.keyboard.press('g')
    await admin.page.keyboard.press('o')
    await admin.page.keyboard.press('Enter')
    await expect(admin.page.getByText('Already used by “Go to Overview”.')).toBeVisible()
    await admin.page.keyboard.press('Escape')

    await admin.page.reload()
    await admin.commandTrigger().waitFor()
    await admin.page.keyboard.press('g')
    await admin.page.keyboard.press('x')
    await expect(admin.page).toHaveURL(/\/admin\/settings/)
  })
})
