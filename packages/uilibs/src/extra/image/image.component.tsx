import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { StyleProp } from '../../styles/types'
import { AspectRatio } from '../aspect-ratio'
import { imageDisplayModes, imageRadii, imageStyles as s } from './image.stylex'

export type ImageDisplayMode = 'cover' | 'contain'
export type ImageBorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full'

export interface ImageProps
  extends Omit<React.ComponentProps<'img'>, 'className' | 'style' | 'alt' | 'src'>, StyleProp {
  src: string
  /**
   * What the picture shows, for assistive technology. Required: an empty string `''` marks a
   * purely decorative picture, which a screen reader skips.
   */
  alt: string
  /** Shown in the picture's box when `src` fails to load, such as a glyph or initials. */
  fallback?: React.ReactNode
  /** Width divided by height, such as `16 / 9`. Without it the box takes the picture's own height. */
  aspectRatio?: number
  /** Corner radius of the box. Default `none`. */
  borderRadius?: ImageBorderRadius
  /** `cover` crops the picture to fill the box (default); `contain` fits all of it inside. */
  displayMode?: ImageDisplayMode
}

/**
 * A picture that keeps its box when it cannot load: the box holds its ratio, and `fallback` fills
 * it in place of the picture. It sits on `AspectRatio`, so `aspectRatio` is the same ratio.
 * `style` applies to the box, and `ref` and the other props go to the `img`.
 */
export function Image({
  src,
  alt,
  fallback,
  aspectRatio,
  borderRadius = 'none',
  displayMode = 'cover',
  style,
  ...props
}: ImageProps) {
  // The failed source, not a flag: a new `src` gets a new try without an effect to reset it.
  const [failedSrc, setFailedSrc] = React.useState<string>()
  const failed = failedSrc === src
  const filled = aspectRatio !== undefined
  const box = [s.root, imageRadii[borderRadius], style]

  const content = failed ? (
    // The `img` is gone, so the box carries its name; a decorative picture stays hidden.
    <div
      role={alt === '' ? undefined : 'img'}
      aria-label={alt === '' ? undefined : alt}
      aria-hidden={alt === '' ? true : undefined}
      data-slot='image-fallback'
      {...stylex.props(s.fallback, filled ? s.fallbackFill : s.fallbackFree)}
    >
      {fallback}
    </div>
  ) : (
    <img
      {...props}
      src={src}
      alt={alt}
      onError={(event) => {
        props.onError?.(event)
        setFailedSrc(src)
      }}
      {...stylex.props(s.image, filled && s.imageFill, imageDisplayModes[displayMode])}
    />
  )

  return filled ? (
    <AspectRatio ratio={aspectRatio} style={box}>
      {content}
    </AspectRatio>
  ) : (
    <div {...stylex.props(box)}>{content}</div>
  )
}
