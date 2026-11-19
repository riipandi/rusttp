import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { Logo } from '#/components/logo'
import { UserMenu } from '#/routes/(app)/-user-menu'
import { styles as layout } from '#/styles/element/layout.stylex'

export function DashboardHeader() {
  return (
    <header {...stylex.props(layout.header)}>
      <div {...stylex.props(layout.container, layout.headerRow)}>
        <Link to='/' {...stylex.props(layout.brand)}>
          <Logo />
          Rusttp
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
