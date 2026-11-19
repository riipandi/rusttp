import { Link as BaseLink, Text as BaseText } from 'jsx-email'
import type { CSSProperties, ReactNode } from 'react'
import { colors } from '../constants.ts'

const sizes = {
  sm: { fontSize: '14px', lineHeight: '20px' },
  md: { fontSize: '16px', lineHeight: '24px' },
  lg: { fontSize: '18px', lineHeight: '28px' }
} as const

interface TextProps {
  size?: keyof typeof sizes
  muted?: boolean
  style?: CSSProperties
  children: ReactNode
}

export function Text({ size = 'md', muted, style, children }: TextProps) {
  return (
    <BaseText
      data-dm={muted ? 'muted' : undefined}
      style={{ ...sizes[size], ...(muted && { color: colors.muted }), ...style }}
    >
      {children}
    </BaseText>
  )
}

export function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <BaseLink
      href={href}
      data-dm='link'
      style={{ color: colors.link, textDecoration: 'underline' }}
    >
      {children}
    </BaseLink>
  )
}
