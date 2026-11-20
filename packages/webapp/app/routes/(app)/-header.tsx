import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { Logo } from '#/components/logo'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { UserMenu } from './-user-menu'

// Placeholders: only Overview has a page, the other sections do nothing until a route is wired in.
const sections = ['Loans', 'Members', 'Reports']

export function DashboardHeader() {
  return (
    <header {...stylex.props(layout.header)}>
      <div {...stylex.props(layout.container, layout.headerRow)}>
        <div {...stylex.props(styles.headerStart)}>
          <Link to='/' {...stylex.props(layout.brand)}>
            <Logo />
            Rusttp
          </Link>
          <nav aria-label='Dashboard' {...stylex.props(styles.nav)}>
            <LinkButton
              render={<Link to='/dashboard' />}
              current
              variant='ghost'
              size='sm'
              style={styles.navCurrent}
            >
              Overview
            </LinkButton>
            {sections.map((label) => (
              <Button key={label} variant='ghost' size='sm' style={styles.navItem}>
                {label}
              </Button>
            ))}
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
