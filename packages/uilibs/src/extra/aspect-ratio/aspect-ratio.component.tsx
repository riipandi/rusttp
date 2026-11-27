import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { PartProps } from '../../styles/types'
import { aspectRatioStyles as s, aspectRatioRatios as ratios } from './aspect-ratio.stylex'

export interface AspectRatioProps extends PartProps<React.ComponentProps<'div'>> {
  ratio: number
  style?: stylex.StyleXStyles
}

export function AspectRatio({ ratio, style, ...props }: AspectRatioProps) {
  return <div {...props} {...stylex.props(s.root, ratios.ratio(ratio), style)} />
}
