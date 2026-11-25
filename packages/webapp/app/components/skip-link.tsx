import * as stylex from '@stylexjs/stylex'
import { useRouter } from '@tanstack/react-router'
import * as React from 'react'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, radius, stroke, unit, zIndex } from 'uilibs/styles/tokens.stylex'
import { useMessages } from '#/libraries/messages'

const targetId = 'main'

const styles = stylex.create({
  link: {
    position: 'fixed',
    insetBlockStart: unit.x2,
    insetInlineStart: unit.x2,
    zIndex: zIndex.overlay,
    paddingBlock: unit.x2,
    paddingInline: unit.x4,
    borderRadius: radius.medium,
    backgroundColor: colors.backgroundPrimary,
    color: colors.onBackgroundPrimary,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    textDecorationLine: 'none',
    // Out of sight until it takes focus: the first Tab stop on the page.
    transform: { default: 'translateY(-200%)', ':focus-visible': 'translateY(0)' },
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: stroke.ring2
  }
})

/**
 * "Skip to content": the first stop in the tab order, hidden until it has focus. It moves focus to the
 * page's `main`, so a keyboard user does not tab through the sidebar or the header on every page.
 * Each page renders its own `<main>` (30 of them), so the link gives the one on screen the `id` it
 * points at when the layout mounts and after each navigation, instead of every page repeating it.
 */
export function SkipLink() {
  const m = useMessages()
  const router = useRouter()
  // The router's resolved event fires after every navigation, once the new page's `main` is in the
  // document: it is where the target id has to land again.
  React.useEffect(() => {
    const mark = () => document.querySelector('main')?.setAttribute('id', targetId)
    mark()
    return router.subscribe('onResolved', mark)
  }, [router])

  return (
    <nav aria-label={m.skip_to_content()}>
      <a
        href={`#${targetId}`}
        {...stylex.props(styles.link)}
        onClick={(event) => {
          const main = document.getElementById(targetId)
          if (!main) return
          event.preventDefault()
          main.tabIndex = -1
          main.focus()
          main.scrollIntoView()
        }}
      >
        {m.skip_to_content()}
      </a>
    </nav>
  )
}
