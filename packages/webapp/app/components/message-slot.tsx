import * as React from 'react'

/**
 * A message with one element in it: `{link}` or `{email}` in the catalog marks where the element
 * goes, so a language can put it anywhere in the sentence. The message is written with the marker
 * left as is (`m.key({ link: marker })`), and the text before and after it is kept in place.
 */
export const slotMarker = (name: string) => `\u0000${name}\u0000`

export function MessageSlot({
  message,
  name,
  children
}: {
  message: string
  name: string
  children: React.ReactNode
}) {
  const marker = slotMarker(name)
  const at = message.indexOf(marker)
  if (at === -1) return message
  return (
    <>
      {message.slice(0, at)}
      {children}
      {message.slice(at + marker.length)}
    </>
  )
}
