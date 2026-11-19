import { Text } from 'jsx-email'
import { colors } from '../constants.ts'

/** A code the reader types back, boxed and spaced for reading off another screen. */
export function OneTimeCode({ children }: { children: string }) {
  return (
    <Text
      data-dm='panel'
      style={{
        margin: '8px 0 24px',
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.panel,
        color: colors.heading,
        fontSize: '22px',
        lineHeight: '30px',
        fontWeight: 600,
        letterSpacing: '6px',
        textAlign: 'center',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
      }}
    >
      {children}
    </Text>
  )
}
