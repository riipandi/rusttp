import type { ReactNode } from 'react'
import { Text } from './text.tsx'

const variants = {
  info: { backgroundColor: '#eff6ff', borderLeft: '3px solid #3b82f6' },
  warning: { backgroundColor: '#fffbeb', borderLeft: '3px solid #f59e0b' },
  success: { backgroundColor: '#f0fdf4', borderLeft: '3px solid #22c55e' }
} as const

interface AlertProps {
  variant: keyof typeof variants
  children: ReactNode
}

/** A callout. Its pale fills keep dark text legible, so it keeps its colours in dark mode. */
export function Alert({ variant, children }: AlertProps) {
  return (
    <Text
      size='sm'
      data-dm='alert'
      style={{
        margin: '0 0 16px',
        padding: '12px 16px',
        borderRadius: '6px',
        color: '#1f2937',
        ...variants[variant]
      }}
    >
      {children}
    </Text>
  )
}
