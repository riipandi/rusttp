import { Text } from 'jsx-email'

/** A code the reader types back. Rendered as one plain string so the text part reads it once. */
export function OneTimeCode({ children }: { children: string }) {
  return (
    <Text
      style={{
        margin: '20px 0',
        fontSize: '24px',
        lineHeight: '32px',
        letterSpacing: '4px',
        textAlign: 'center',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
      }}
    >
      {children}
    </Text>
  )
}
