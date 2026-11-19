import { Link as BaseLink, Text as BaseText } from 'jsx-email'
import type { CSSProperties, ReactNode } from 'react'
import { colors } from '../constants.ts'

const sizes = {
  sm: { fontSize: '13px', lineHeight: '20px' },
  md: { fontSize: '15px', lineHeight: '24px' }
} as const

interface TextProps {
  size?: keyof typeof sizes
  muted?: boolean
  /** Dark-mode hook (see `layout.tsx`); `muted` sets its own. */
  'data-dm'?: string
  style?: CSSProperties
  children: ReactNode
}

export function Text({ size = 'md', muted, style, children, ...props }: TextProps) {
  return (
    <BaseText
      data-dm={muted ? 'muted' : props['data-dm']}
      style={{
        margin: '0 0 16px',
        color: muted ? colors.muted : colors.text,
        ...sizes[size],
        ...style
      }}
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
      style={{ color: colors.link, textDecoration: 'underline', wordBreak: 'break-all' }}
    >
      {children}
    </BaseLink>
  )
}
