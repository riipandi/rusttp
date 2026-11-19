import type { CSSProperties } from 'react'
import { colors } from '../constants.ts'

/** Styles for jsx-email's `Markdown`, matching `Text` and `Link`. */
export const markdownStyles = {
  p: { fontSize: '16px', lineHeight: '24px', margin: '16px 0' },
  link: { color: colors.link, textDecoration: 'underline' }
} satisfies Record<string, CSSProperties>
