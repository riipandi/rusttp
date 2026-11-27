import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { PartProps } from '../../styles/types'
import { kbdStyles as s } from './kbd.stylex'

/** Renders a `kbd`; `render` swaps it for another element. */
export function Kbd({ style, render, ...props }: PartProps<useRender.ComponentProps<'kbd'>>) {
  return useRender({
    defaultTagName: 'kbd',
    props: mergeProps<'kbd'>(stylex.props(s.root, style), props),
    render
  })
}

export function KbdGroup({ style, ...props }: PartProps<React.ComponentProps<'kbd'>>) {
  return <kbd {...props} {...stylex.props(s.group, style)} />
}
