import { Bell, PanelLeftClose, PanelLeftOpen } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import { Separator } from 'uilibs/base/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'uilibs/base/tooltip'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { type NavItem, useIsCurrent } from '#/components/nav-sheet'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/element/sidebar.stylex'
import { groups } from './-nav'
import { AdminUserMenu } from './-user-menu'

function NavEntry({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const current = useIsCurrent(item)
  const { label, icon, to } = item
  const style = [
    styles.item,
    collapsed && styles.itemCollapsed,
    current ? styles.itemCurrent : styles.itemIdle
  ]
  const content = (
    <>
      <Icon svg={icon} size={16} color={to ? undefined : 'neutralFaded'} />
      {!collapsed && label}
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

// Placeholder: the count is fixed and nothing opens until notifications have a source. Set it to 0
// to hide the indicator.
const unread = 3

// A bell with a dot while something is unread. Collapsed, it is the rail entry above the account
// avatar; expanded, an icon at the end of the account strip, beside the menu trigger. The count is
// in the accessible name and the tooltip, not on screen: the dot only says there is something new.
function NotifyEntry({ collapsed }: { collapsed: boolean }) {
  const name = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
  const trigger = (
    <Button
      variant='ghost'
      size={collapsed ? 'sm' : 'icon-md'}
      aria-label={name}
      style={[
        collapsed && styles.item,
        collapsed && styles.itemCollapsed,
        styles.itemIdle,
        unread > 0 && styles.itemUnread
      ]}
    />
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger}>
        <span {...stylex.props(styles.bell)}>
          <Icon svg={Bell} size={collapsed ? 16 : 20} />
          {unread > 0 && <span aria-hidden='true' {...stylex.props(styles.dot)} />}
        </span>
      </TooltipTrigger>
      <TooltipContent side={collapsed ? 'right' : 'top'}>{name}</TooltipContent>
    </Tooltip>
  )
}

export function Sidebar() {
  const id = React.useId()
  const navId = `${id}-nav`
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside {...stylex.props(styles.root, collapsed && styles.rootCollapsed)}>
      {/* Collapsed, the whole strip is the hover target that swaps the logo for the expand icon. */}
      <div
        {...stylex.props(
          styles.header,
          collapsed && styles.headerCollapsed,
          collapsed && stylex.defaultMarker()
        )}
      >
        {collapsed ? (
          <Button
            variant='ghost'
            size='icon-md'
            aria-label='Expand sidebar'
            aria-expanded={false}
            aria-controls={navId}
            onClick={() => setCollapsed(false)}
            style={styles.trigger}
          >
            <span {...stylex.props(styles.swap)}>
              <span {...stylex.props(styles.swapLogo)}>
                <Logo />
              </span>
              <span {...stylex.props(styles.swapIcon)}>
                <Icon svg={PanelLeftOpen} size={16} />
              </span>
            </span>
          </Button>
        ) : (
          <>
            <Link to='/admin' {...stylex.props(layout.brand, styles.brand)}>
              <Logo />
              Rusttp
            </Link>
            <Button
              variant='ghost'
              size='icon-sm'
              aria-label='Collapse sidebar'
              aria-expanded
              aria-controls={navId}
              onClick={() => setCollapsed(true)}
              style={styles.trigger}
            >
              <Icon svg={PanelLeftClose} size={16} />
            </Button>
          </>
        )}
      </div>

      {/* The provider's zero delay shows a rail tooltip at once, and moving between items keeps it. */}
      <TooltipProvider>
        <nav
          id={navId}
          aria-label='Admin'
          {...stylex.props(styles.nav, collapsed && styles.navCollapsed)}
        >
          {groups.map(({ label, items }, index) => (
            <React.Fragment key={label ?? 'main'}>
              {/* Collapsed, the labels are gone, so a muted rule marks where a group ends. */}
              {collapsed && index > 0 && <Separator style={styles.railSeparator} />}
              <div {...stylex.props(styles.group)}>
                {label && !collapsed && (
                  <span id={`${id}-${label}`} {...stylex.props(styles.groupLabel)}>
                    {label}
                  </span>
                )}
                <ul
                  aria-labelledby={label && !collapsed ? `${id}-${label}` : undefined}
                  aria-label={label && collapsed ? label : undefined}
                  {...stylex.props(styles.list)}
                >
                  {items.map((item) => (
                    <li key={item.label}>
                      <NavEntry item={item} collapsed={collapsed} />
                    </li>
                  ))}
                </ul>
              </div>
            </React.Fragment>
          ))}
        </nav>

        {collapsed && (
          <div {...stylex.props(styles.notify)}>
            <NotifyEntry collapsed />
          </div>
        )}

        <div {...stylex.props(styles.account, collapsed && styles.accountCollapsed)}>
          <AdminUserMenu collapsed={collapsed} />
          {!collapsed && <NotifyEntry collapsed={false} />}
        </div>
      </TooltipProvider>
    </aside>
  )
}
