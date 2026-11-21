import { PanelLeftClose, PanelLeftOpen } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'uilibs/base/tooltip'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { type NavItem, useIsCurrent } from '#/components/nav-sheet'
import { NotificationsPopover } from '#/components/notifications'
import { useNotifications } from '#/libraries/notifications'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/element/sidebar.stylex'
import { CommandBarTrigger } from './-commandbar'
import { groups } from './-nav'
import { AdminUserMenu } from './-user-menu'

function NavEntry({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const current = useIsCurrent(item)
  const { label, icon, to } = item
  const style = [styles.item, current ? styles.itemCurrent : styles.itemIdle]
  // The label stays in the row and fades, so the icon never moves while the width animates.
  const content = (
    <>
      <Icon svg={icon} size={16} color={to ? undefined : 'neutralFaded'} />
      <span {...stylex.props(styles.label, collapsed && styles.faded)}>{label}</span>
    </>
  )
  // Collapsed, the label is gone from the row: it becomes the accessible name and a tooltip.
  const trigger = to ? (
    <LinkButton
      render={<Link to={to} />}
      current={current}
      variant='ghost'
      size='sm'
      aria-label={collapsed ? label : undefined}
      style={style}
    />
  ) : (
    <Button
      variant='ghost'
      size='sm'
      aria-disabled
      aria-label={collapsed ? label : undefined}
      style={style}
    />
  )

  if (!collapsed) return React.cloneElement(trigger, undefined, content)

  return (
    <Tooltip>
      <TooltipTrigger render={trigger}>{content}</TooltipTrigger>
      <TooltipContent side='right'>{label}</TooltipContent>
    </Tooltip>
  )
}

// Collapsed, the bell is the rail entry above the account avatar; expanded, an icon at the end of
// the account strip, beside the menu trigger. The popover opens beside the sidebar.
function NotifyEntry({ collapsed }: { collapsed: boolean }) {
  const { unread } = useNotifications()
  return (
    <NotificationsPopover
      to='/admin/notifications'
      // Expanded, it opens above the bell and grows toward the sidebar's left edge; it is wider than
      // the room there, so it shifts right rather than flipping to the bell's other side. The rail
      // has no room to its left and opens beside it.
      side={collapsed ? 'right' : 'top'}
      align='end'
      collisionAvoidance={{ side: 'flip', align: 'shift' }}
      // The user menu's edges: 12px from the sidebar's left edge expanded; the rail's menu sits 72px
      // in. Its bottom edge is 22px above the strip, so the offsets match it.
      collisionPadding={12}
      sideOffset={collapsed ? 21 : 22}
      tooltipSide={collapsed ? 'right' : 'top'}
      iconSize={collapsed ? 16 : 20}
      trigger={
        <Button
          variant='ghost'
          size={collapsed ? 'sm' : 'icon-md'}
          style={[collapsed && styles.item, styles.itemIdle, unread > 0 && styles.itemUnread]}
        />
      }
    />
  )
}

// The collapse persists per browser. Anything but `collapsed` (a missing key, an unknown value, a
// storage that throws) opens expanded; a failed write keeps the state for the session only.
const storageKey = 'admin-sidebar'

function readCollapsed() {
  try {
    return localStorage.getItem(storageKey) === 'collapsed'
  } catch {
    return false
  }
}

/**
 * The sidebar's collapse, held by the admin layout so the sidebar's own buttons and the Cmd/Ctrl+B
 * shortcut change one state. Under `/admin/settings` it shows as the rail whatever is stored, and a
 * toggle there lasts for that visit only: neither writes the key, so leaving settings restores it.
 */
export function useSidebarCollapse() {
  // The SPA renders on the client only, so the stored value is read before the first paint.
  const [stored, setStored] = React.useState(readCollapsed)
  // The settings pages bring their own aside, so the sidebar folds to the rail there.
  const onSettings = useIsCurrent({ to: '/admin/settings' })
  const [visit, setVisit] = React.useState<boolean | null>(null)
  if (!onSettings && visit !== null) setVisit(null)
  const collapsed = onSettings ? (visit ?? true) : stored

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (onSettings) return setVisit(next)
      setStored(next)
      try {
        localStorage.setItem(storageKey, next ? 'collapsed' : 'expanded')
      } catch {}
    },
    [onSettings]
  )

  return { collapsed, setCollapsed }
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
  onOpenCommandBar
}: {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onOpenCommandBar: () => void
}) {
  const id = React.useId()
  const navId = `${id}-nav`
  const toggle = onCollapsedChange

  return (
    <aside {...stylex.props(styles.root, collapsed && styles.rootCollapsed)}>
      {/* The provider's zero delay shows a rail tooltip at once, and moving between items keeps it. */}
      <TooltipProvider>
        {/* Collapsed, the whole strip is the hover target that swaps the logo for the expand icon. */}
        <div
          {...stylex.props(
            styles.header,
            collapsed && styles.headerCollapsed,
            collapsed && stylex.defaultMarker()
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label='Expand sidebar'
                    aria-expanded={false}
                    aria-controls={navId}
                    onClick={() => toggle(false)}
                    style={styles.trigger}
                  />
                }
              >
                <span {...stylex.props(styles.swap)}>
                  <span {...stylex.props(styles.swapLogo)}>
                    <Logo />
                  </span>
                  <span {...stylex.props(styles.swapIcon)}>
                    <Icon svg={PanelLeftOpen} size={16} />
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side='right'>Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <>
              {/* Not a link: the Overview item already leads to `/admin`. */}
              <span {...stylex.props(layout.brand, styles.brand)}>
                <Logo />
                Rusttp
              </span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label='Collapse sidebar'
                      aria-expanded
                      aria-controls={navId}
                      onClick={() => toggle(true)}
                      style={styles.trigger}
                    />
                  }
                >
                  <Icon svg={PanelLeftClose} size={16} />
                </TooltipTrigger>
                <TooltipContent side='right'>Collapse sidebar</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        <div {...stylex.props(styles.search)}>
          <CommandBarTrigger collapsed={collapsed} onOpen={onOpenCommandBar} />
        </div>

        <nav id={navId} aria-label='Admin' {...stylex.props(styles.nav, styles.navUnderSearch)}>
          {groups.map(({ label, items }) => (
            <div key={label ?? 'main'} {...stylex.props(styles.group)}>
              {label && (
                <>
                  {/* Collapsed, the label's row folds to nothing and a muted rule marks the break. */}
                  <span
                    aria-hidden='true'
                    {...stylex.props(styles.rule, collapsed && styles.ruleShown)}
                  />
                  <div
                    {...stylex.props(styles.groupLabelRow, collapsed && styles.groupLabelRowFolded)}
                  >
                    <span
                      id={`${id}-${label}`}
                      {...stylex.props(styles.groupLabel, collapsed && styles.faded)}
                    >
                      {label}
                    </span>
                  </div>
                </>
              )}
              <ul
                aria-labelledby={label ? `${id}-${label}` : undefined}
                {...stylex.props(styles.list)}
              >
                {items.map((item) => (
                  <li key={item.label}>
                    <NavEntry item={item} collapsed={collapsed} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {collapsed && (
          <div {...stylex.props(styles.notify)}>
            <NotifyEntry collapsed />
          </div>
        )}

        <div {...stylex.props(styles.account)}>
          <AdminUserMenu collapsed={collapsed} />
          {!collapsed && <NotifyEntry collapsed={false} />}
        </div>
      </TooltipProvider>
    </aside>
  )
}
