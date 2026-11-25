import * as stylex from '@stylexjs/stylex'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import * as React from 'react'
import { LinkButton } from 'uilibs/base/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from 'uilibs/base/select'
import { useIsCurrent } from '#/components/nav-sheet'
import { useMessages } from '#/libraries/messages'
import { styles as sidebar } from '#/styles/element/sidebar.stylex'
import { styles } from '#/styles/pages/admin.stylex'
import { groups as navGroups, pages as navPages, type Page } from './-nav'

function AsideEntry({ page }: { page: Page }) {
  const current = useIsCurrent(page)
  return (
    <LinkButton
      render={<Link to={page.to} />}
      current={current}
      variant='ghost'
      size='small'
      style={[sidebar.item, current ? sidebar.itemCurrent : sidebar.itemIdle]}
    >
      {page.label}
    </LinkButton>
  )
}

// Both are always rendered; the stylesheet shows the aside above the compact breakpoint and the
// select below it, so no media hook is needed.
export function SettingsNav() {
  const m = useMessages()
  const id = React.useId()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const groups = navGroups(m)
  const pages = navPages(m)
  const current = pages.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))

  return (
    <>
      <nav aria-label={m.settings_nav_landmark()} {...stylex.props(styles.settingsAside)}>
        {groups.map((group) => {
          const { label } = group
          const labelId = label && `${id}-${label}`
          return (
            <div key={label ?? 'main'} {...stylex.props(sidebar.group)}>
              {label && (
                <span id={labelId} {...stylex.props(sidebar.groupLabel)}>
                  {label}
                </span>
              )}
              <ul aria-labelledby={labelId} {...stylex.props(sidebar.list)}>
                {group.items.map((page) => (
                  <li key={page.to}>
                    <AsideEntry page={page} />
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
      <nav aria-label={m.settings_nav_landmark()} {...stylex.props(styles.settingsPicker)}>
        <Select
          items={pages.map(({ label, to }) => ({ label, value: to }))}
          value={current?.to ?? null}
          onValueChange={(to) => {
            if (to) void navigate({ to })
          }}
        >
          <SelectTrigger aria-label={m.settings_nav_picker()}>
            <SelectValue placeholder={m.settings_nav_landmark()} />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group, index) => {
              const { label } = group
              return (
                <React.Fragment key={label ?? 'main'}>
                  {index > 0 && <SelectSeparator />}
                  <SelectGroup>
                    {label && <SelectLabel>{label}</SelectLabel>}
                    {group.items.map(({ label: name, to }) => (
                      <SelectItem key={to} value={to}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </React.Fragment>
              )
            })}
          </SelectContent>
        </Select>
      </nav>
    </>
  )
}
