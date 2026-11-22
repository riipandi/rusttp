import * as React from 'react'
import { act } from 'react'
import { beforeEach, describe, expect, test } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { localeStore } from '#/libraries/locale.store'
import { getMessages, useMessages } from '#/libraries/messages'
import en from '#/locales/en.json'
import id from '#/locales/id.json'

// The catalogs are read straight from `app/locales/*.json`, so an expected text does not come
// from the generated functions under test.
beforeEach(() => {
  localStorage.clear()
  localeStore.setState(() => 'en')
})
const show = (locale: 'en' | 'id') => act(async () => localeStore.actions.set(locale))

// A memoized child with no props is the case the React Compiler would freeze, if the hook did not
// return a different object for each language.
const Memoized = React.memo(function Memoized() {
  const m = useMessages()
  return <p data-testid='memoized'>{m.page_home()}</p>
})
function Page() {
  const m = useMessages()
  return (
    <div>
      <label>
        {m.language_label()}
        <input data-testid='typed' />
      </label>
      <Memoized />
    </div>
  )
}

describe('useMessages', () => {
  test('returns one object per language, the same one each time', async () => {
    const { result } = await renderHook(() => useMessages())
    const english = result.current

    await show('id')
    const indonesian = result.current
    expect(indonesian).not.toBe(english)

    await show('en')
    expect(result.current).toBe(english)
  })

  test('a message reads in the language shown', async () => {
    const { result } = await renderHook(() => useMessages())
    expect(result.current.language_label()).toBe(en.language_label)

    await show('id')

    expect(result.current.language_label()).toBe(id.language_label)
    expect(id.language_label).not.toBe(en.language_label)
  })

  test('a message takes its value by name', async () => {
    const { result } = await renderHook(() => useMessages())
    expect(result.current.notifications_title_unread({ count: 3 })).toBe(
      en.notifications_title_unread.replace('{count}', '3')
    )

    await show('id')

    expect(result.current.notifications_title_unread({ count: 3 })).toBe(
      id.notifications_title_unread.replace('{count}', '3')
    )
  })

  test('components change language in place: typed input stays, a memoized child follows', async () => {
    await render(<Page />)
    const input = page.getByTestId('typed')
    await input.fill('sangreal')

    await show('id')

    await expect.element(page.getByText(id.language_label)).toBeInTheDocument()
    await expect.element(page.getByTestId('memoized')).toHaveTextContent(id.page_home)
    await expect.element(input).toHaveValue('sangreal')
  })
})

describe('getMessages', () => {
  test('follows the language shown at the moment it is called', async () => {
    expect(getMessages().page_home()).toBe(en.page_home)

    await show('id')

    expect(getMessages().page_home()).toBe(id.page_home)
  })
})
