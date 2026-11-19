import type { ReactNode } from 'react'
import { Text } from './text.tsx'

const variants = {
  info: { backgroundColor: '#d1ecf1', borderLeft: '4px solid #17a2b8' },
  warning: { backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' },
  success: { backgroundColor: '#d4edda', borderLeft: '4px solid #28a745' }
} as const

interface AlertProps {
  variant: keyof typeof variants
  children: ReactNode
}

/** A callout. Its colours stay the same in dark mode: the pale fills keep their dark text legible. */
export function Alert({ variant, children }: AlertProps) {
  return (
    <Text
      size='sm'
      style={{
        padding: '16px 18px',
        margin: '20px 0 16px',
        borderRadius: '8px',
        color: '#1a1a1a',
        ...variants[variant]
      }}
    >
      {children}
    </Text>
  )
}
