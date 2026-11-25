import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import type { ColorRole, Glyph, StyleProp } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import { linkColors, linkStyles as s, linkVariants } from './link.stylex'

export type LinkColor = ColorRole | 'inherit'
/** `underline` is always drawn; `plain` draws it only on hover. */
export type LinkVariant = 'underline' | 'plain'

export interface LinkProps
  extends Omit<useRender.ComponentProps<'a'>, 'className' | 'style' | 'color'>, StyleProp {
  /** The role; `inherit` takes the text color around it. Default `primary`. */
  color?: LinkColor
  /** Default `underline`: color alone does not mark a link inside running text. */
  variant?: LinkVariant
  /** A glyph before the text. */
  icon?: Glyph
  /** A glyph after the text. */
  endIcon?: Glyph
}

function withGlyphs(children: React.ReactNode, Icon?: Glyph, EndIcon?: Glyph) {
  return (
    <>
      {Icon ? <Icon size={glyphSize.small} aria-hidden /> : null}
      {children}
      {EndIcon ? <EndIcon size={glyphSize.small} aria-hidden /> : null}
    </>
  )
}

/**
 * A text link. It renders an `a`; `render` swaps in a router link, which keeps its own typed props
 * (`<Link render={<RouterLink to='/login' />}>`), and the class, handlers, and ref merge onto it.
 */
export function Link({
  color = 'primary',
  variant = 'underline',
  icon: Icon,
  endIcon: EndIcon,
  style,
  render,
  ref,
  children,
  ...props
}: LinkProps) {
  return useRender({
    defaultTagName: 'a',
    render,
    // `mergeProps` does not merge refs.
    ref,
    props: mergeProps<'a'>(
      stylex.props(
        focusRing.root,
        s.root,
        linkColors[color],
        linkVariants[variant],
        (Icon || EndIcon) && s.withGlyph,
        style
      ),
      props,
      // Wrapped only with a glyph: bare `children` (a router link's render function) pass as they are.
      { children: Icon || EndIcon ? withGlyphs(children, Icon, EndIcon) : children }
    )
  })
}
