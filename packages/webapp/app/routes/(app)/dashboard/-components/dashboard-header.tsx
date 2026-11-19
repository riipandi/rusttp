import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from 'uilibs/base/avatar'
import { Button } from 'uilibs/base/button'
import { ThemeSwitcher } from 'uilibs/theme'
import { Logo } from '#/components/logo'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'

export function DashboardHeader() {
  return (
    <header {...stylex.props(layout.header)}>
      <div {...stylex.props(layout.container, layout.headerRow)}>
        <Link to='/' {...stylex.props(layout.brand)}>
          <Logo />
          Rusttp
        </Link>
        <div {...stylex.props(styles.account)}>
          <ThemeSwitcher />
          <Avatar>
            <AvatarFallback>HG</AvatarFallback>
          </Avatar>
          <Button variant='ghost' size='sm' nativeButton={false} render={<Link to='/' />}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
