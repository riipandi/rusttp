import { Button as BaseButton } from 'jsx-email'
import type { ReactNode } from 'react'
import { colors } from '../constants.ts'

/** A centred call to action; jsx-email's `Button` adds the VML fallback Outlook needs. */
export function Button({ href, children }: { href: string; children: ReactNode }) {
  return (
    <BaseButton
      href={href}
      align='center'
      width={220}
      height={44}
      backgroundColor={colors.button}
      textColor='#ffffff'
      borderRadius={8}
      fontSize={14}
      style={{ margin: '20px auto', fontWeight: 500 }}
    >
      {children}
    </BaseButton>
  )
}
