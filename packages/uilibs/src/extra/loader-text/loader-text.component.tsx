import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { Glyph } from '../../styles/types'
import { Text, type TextProps } from '../text'
import { loaderTextStyles as styles } from './loader-text.stylex'

export interface LoaderTextProps extends Omit<TextProps, 'style'> {
  /** Leading icon, sized relative to the text. */
  icon?: Glyph
  /** Text that cross-fades with the children once `completed` becomes true. */
  completedText?: React.ReactNode
  /** Mark the loader as completed, stopping the shimmer. */
  completed?: boolean
  style?: stylex.StyleXStyles
}

/**
 * Both texts stay mounted for the cross-fade, but only the current one is exposed to assistive
 * technology. With `completedText` the pair sits in one `role='status'` region, which announces the
 * swap when `completed` flips.
 */
export function LoaderText({
  icon: Icon,
  children,
  completedText,
  completed = false,
  variant = 'body-2',
  style,
  ...props
}: LoaderTextProps) {
  const hasCompletedText = completedText != null
  const showCompleted = hasCompletedText && completed

  return (
    <Text variant={variant} {...props} style={[styles.root, style]}>
      {Icon ? (
        <Icon size='1em' strokeWidth={1.8} aria-hidden {...stylex.props(styles.icon)} />
      ) : null}
      <span role={hasCompletedText ? 'status' : undefined} {...stylex.props(styles.container)}>
        <span
          aria-hidden={showCompleted || undefined}
          {...stylex.props(
            styles.text,
            !completed && styles.textShimmer,
            showCompleted && styles.textExit
          )}
        >
          {children}
        </span>
        {hasCompletedText ? (
          <span
            aria-hidden={!showCompleted}
            {...stylex.props(styles.completedText, showCompleted && styles.completedTextEnter)}
          >
            {completedText}
          </span>
        ) : null}
      </span>
    </Text>
  )
}
