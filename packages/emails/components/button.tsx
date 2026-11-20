import { Button as BaseButton } from 'jsx-email'
import type { ReactNode } from 'react'
import { colors } from '../constants.ts'

/** A call to action; jsx-email's `Button` adds the VML fallback Outlook needs. */
export function Button({ href, children }: { href: string; children: ReactNode }) {
  return (
    <BaseButton
      href={href}
      align='left'
      width={200}
      height={44}
      backgroundColor={colors.button}
      textColor='#ffffff'
      borderRadius={8}
      fontSize={15}
      style={{ margin: '0 0 16px', fontWeight: 600 }}
    >
      {children}
    </BaseButton>
  )
}
