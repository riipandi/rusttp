import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { StyleProp } from '../../styles/types'
import { kbdStyles as s } from './kbd.stylex'

export function Kbd({
  style,
  ...props
}: Omit<React.ComponentProps<'kbd'>, 'className' | 'style'> & StyleProp) {
  return <kbd {...props} {...stylex.props(s.root, style)} />
}

export function KbdGroup({
  style,
  ...props
}: Omit<React.ComponentProps<'kbd'>, 'className' | 'style'> & StyleProp) {
  return <kbd {...props} {...stylex.props(s.group, style)} />
}
