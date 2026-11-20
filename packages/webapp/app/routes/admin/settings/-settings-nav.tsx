import * as stylex from '@stylexjs/stylex'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { LinkButton } from 'uilibs/base/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'uilibs/base/select'
import { useIsCurrent } from '#/components/nav-sheet'
import { styles as sidebar } from '#/styles/element/sidebar.stylex'
import { styles } from '#/styles/pages/admin.stylex'
import { pages } from './-nav'

function AsideEntry({ page }: { page: (typeof pages)[number] }) {
  const current = useIsCurrent(page)
  return (
    <LinkButton
      render={<Link to={page.to} />}
      current={current}
      variant='ghost'
      size='sm'
      style={[sidebar.item, current ? sidebar.itemCurrent : sidebar.itemIdle]}
    >
      {page.label}
    </LinkButton>
  )
}

// Both are always rendered; the stylesheet shows the aside above the compact breakpoint and the
// select below it, so no media hook is needed.
export function SettingsNav() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const current = pages.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))

  return (
    <>
      <nav aria-label='Settings' {...stylex.props(styles.settingsAside)}>
        <ul {...stylex.props(sidebar.list)}>
          {pages.map((page) => (
            <li key={page.to}>
              <AsideEntry page={page} />
            </li>
          ))}
        </ul>
      </nav>
      <div {...stylex.props(styles.settingsPicker)}>
        <Select
          items={pages.map(({ label, to }) => ({ label, value: to }))}
          value={current?.to ?? null}
          onValueChange={(to) => {
            if (to) void navigate({ to })
          }}
        >
          <SelectTrigger aria-label='Settings section'>
            <SelectValue placeholder='Settings' />
          </SelectTrigger>
          <SelectContent>
            {pages.map(({ label, to }) => (
              <SelectItem key={to} value={to}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
