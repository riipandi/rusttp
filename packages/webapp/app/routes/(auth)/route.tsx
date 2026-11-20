import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ThemeSwitcher } from 'uilibs/theme'
import { Logo } from '#/components/logo'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/auth.stylex'

// The layout every auth page shares: a brand panel on wide screens, and the page itself in the form column.
export const Route = createFileRoute('/(auth)')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div {...stylex.props(styles.split)}>
      <aside {...stylex.props(styles.panel)}>
        <Link to='/' {...stylex.props(layout.brand)}>
          <Logo />
          Rusttp
        </Link>
        <div>
          <p {...stylex.props(styles.panelTitle)}>One Rust binary, from server to screen.</p>
          <p {...stylex.props(styles.panelText)}>
            The server renders the document, the React app takes over, and both ship together.
          </p>
        </div>
      </aside>

      <main {...stylex.props(styles.formSide)}>
        <div {...stylex.props(styles.topRow)}>
          <Link to='/' {...stylex.props(layout.brand, styles.mobileBrand)}>
            <Logo />
            Rusttp
          </Link>
          <div {...stylex.props(styles.theme)}>
            <ThemeSwitcher />
          </div>
        </div>

        <div {...stylex.props(styles.formWrap)}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
