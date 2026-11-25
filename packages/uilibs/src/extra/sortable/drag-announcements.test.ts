import type { Active, Announcements, Over } from '@dnd-kit/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultDragLabels, dragAccessibility, nameOfElement } from './drag-announcements'

const names: Record<string, string> = { a: 'Expecto Patronum', b: 'Lumos', c: 'Alohomora' }
const nameOf = (id: string | number) => names[String(id)] ?? String(id)

const box = { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
const active = (id: string): Active => ({
  id,
  data: { current: undefined },
  rect: { current: { initial: null, translated: null } }
})
const over = (id: string): Over => ({
  id,
  rect: box,
  disabled: false,
  data: { current: undefined }
})

// Only `active.id` and `over.id` are read; the rest is what dnd-kit's types require.
const event = (from: string, to?: string) => ({
  active: active(from),
  over: to ? over(to) : null,
  collisions: null,
  delta: { x: 0, y: 0 }
})

const announcements = (): Announcements => {
  const spoken = dragAccessibility(defaultDragLabels, nameOf, undefined)?.announcements
  if (!spoken) throw new Error('No announcements')
  return spoken
}

describe('dragAccessibility', () => {
  it('names the item by its label, not its id', () => {
    expect(announcements().onDragStart?.(event('a'))).toBe('Picked up Expecto Patronum.')
    expect(announcements().onDragCancel?.(event('b'))).toBe(
      'Dragging cancelled. Lumos returned to its place.'
    )
  })

  it('announces a move over another item', () => {
    expect(announcements().onDragOver?.(event('a', 'b'))).toBe('Expecto Patronum moved over Lumos.')
  })

  it('stays silent when the item is reported over itself, so "Picked up" is read in full', () => {
    expect(announcements().onDragOver?.(event('a', 'a'))).toBeUndefined()
    expect(announcements().onDragOver?.(event('a'))).toBeUndefined()
  })

  it('says where the item landed, or that it landed nowhere', () => {
    expect(announcements().onDragEnd?.(event('a', 'c'))).toBe(
      'Expecto Patronum dropped over Alohomora.'
    )
    expect(announcements().onDragEnd?.(event('a'))).toBe('Expecto Patronum was dropped.')
  })

  it('speaks the labels it is given, in any language', () => {
    const accessibility = dragAccessibility(
      {
        ...defaultDragLabels,
        instructions: 'Tekan spasi.',
        pickedUp: (name) => `Diangkat: ${name}`
      },
      nameOf,
      undefined
    )
    expect(accessibility?.screenReaderInstructions?.draggable).toBe('Tekan spasi.')
    expect(accessibility?.announcements?.onDragStart?.(event('b'))).toBe('Diangkat: Lumos')
  })

  it('lets a prop the caller passes win over the defaults, key by key', () => {
    const accessibility = dragAccessibility(defaultDragLabels, nameOf, {
      screenReaderInstructions: { draggable: 'Custom' }
    })
    expect(accessibility?.screenReaderInstructions?.draggable).toBe('Custom')
    expect(accessibility?.announcements?.onDragStart?.(event('a'))).toBe(
      'Picked up Expecto Patronum.'
    )
  })
})

const mount = (html: string) => {
  document.body.innerHTML = html
}

describe('nameOfElement', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('prefers aria-label, then the collapsed text, then the id', () => {
    mount(
      '<li id="x" aria-label="Wingardium Leviosa">ignored</li><li id="y">  Petrificus \n  Totalus </li>'
    )
    expect(nameOfElement('#x', 1)).toBe('Wingardium Leviosa')
    expect(nameOfElement('#y', 2)).toBe('Petrificus Totalus')
    expect(nameOfElement('#missing', 3)).toBe('3')
  })

  it('skips the text when asked, for a handle whose text is not a name', () => {
    mount('<li id="y">Petrificus Totalus</li>')
    expect(nameOfElement('#y', 'row-7', false)).toBe('row-7')
  })
})
