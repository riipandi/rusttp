import { Raw } from 'jsx-email'
import type { ReactNode } from 'react'

const placeholder = /^\{\{(\w+)\}\}$/

interface WhenProps {
  /** A prop of the template: a sample value in previews, a `{{name}}` placeholder when built. */
  value: string
  children: ReactNode
  otherwise?: ReactNode
}

/**
 * Renders `children` when `value` is non-empty, `otherwise` when it is empty. A `{{name}}`
 * placeholder cannot be tested at build time, so it becomes a Jinja `{% if name %}` block
 * through `Raw` and the server decides at send time.
 */
export function When({ value, children, otherwise }: WhenProps) {
  const name = placeholder.exec(value)?.[1]
  if (!name) return <>{value ? children : otherwise}</>

  return (
    <>
      <Raw content={`{% if ${name} %}`} />
      {children}
      {otherwise !== undefined && (
        <>
          <Raw content='{% else %}' />
          {otherwise}
        </>
      )}
      <Raw content='{% endif %}' />
    </>
  )
}
