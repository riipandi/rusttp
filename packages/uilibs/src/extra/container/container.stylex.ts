import * as stylex from '@stylexjs/stylex'
import { container } from '../../styles/tokens.stylex'

export const containerStyles = stylex.create({
  root: { boxSizing: 'border-box', marginInline: 'auto', width: '100%' },
  // A size that is a CSS length, or a count of `unit` steps of padding, is known only at run time.
  maxWidth: (value: string) => ({ maxWidth: value }),
  padding: (value: string) => ({ padding: value })
})

export const containerSizes = stylex.create({
  xxsmall: { maxWidth: container.xxsmall },
  xsmall: { maxWidth: container.xsmall },
  small: { maxWidth: container.small },
  medium: { maxWidth: container.medium },
  large: { maxWidth: container.large },
  xlarge: { maxWidth: container.xlarge },
  xxlarge: { maxWidth: container.xxlarge }
})
