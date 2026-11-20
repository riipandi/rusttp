import type { CSSProperties } from 'react'
import { colors } from '../constants.ts'

/** Styles for jsx-email's `Markdown`, matching `Text` and `Link`. */
export const markdownStyles = {
  p: { fontSize: '15px', lineHeight: '24px', margin: '0 0 16px', color: colors.text },
  link: { color: colors.link, textDecoration: 'underline' }
} satisfies Record<string, CSSProperties>
