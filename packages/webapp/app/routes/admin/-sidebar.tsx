import { PanelLeftClose, PanelLeftOpen } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import { Tooltip, TooltipContent, TooltipTrigger } from 'uilibs/base/tooltip'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { type NavItem, useIsCurrent } from '#/components/nav-sheet'
import { NotificationsPopover } from '#/components/notifications'
import { useMessages } from '#/libraries/messages'
import { unreadCount } from '#/libraries/notifications.store'
import { sidebarCollapsed, sidebarStore } from '#/libraries/sidebar.store'
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
//
// One element in both states: the slot is absolutely placed against the sidebar's bottom corner and
// travels between the two spots (a transform, with the same duration and easing as the width), so
// the bell glides instead of unmounting in one place and mounting in the other, and an open popover
// or a keyboard focus survives the toggle.
function NotifyEntry({ collapsed }: { collapsed: boolean }) {
  // Only whether any are unread decides the dot, so a count that moves from 3 to 2 renders nothing.
  const anyUnread = useSelector(unreadCount, (count) => count > 0)
  return (
    <div {...stylex.props(styles.notifySlot, collapsed && styles.notifySlotRail)}>
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
        // The icon is 20px in both states and scales down in the rail, so it animates with the slot.
        iconSize={20}
        iconStyle={[styles.notifyIcon, collapsed && styles.notifyIconRail]}
        trigger={
          <Button
            variant='ghost'
            size='icon-md'
            style={[styles.notifyButton, styles.itemIdle, anyUnread && styles.itemUnread]}
          />
        }
      />
    </div>
  )
}

/**
 * The settings pages bring their own aside, so the sidebar folds to the rail there. The route is the
 * only thing the store cannot know, so the layout feeds it in; the layout effect lands before paint.
 */
export function useFoldSidebarOnSettings() {
  const onSettings = useIsCurrent({ to: '/admin/settings' })
  React.useLayoutEffect(() => sidebarStore.actions.setRail(onSettings), [onSettings])
}

/**
 * True once the rail has finished closing. The logo gives way to the expand icon while the header is
 * hovered, but right after a click the pointer is still over the header as the width shrinks away
 * from it: reacting to that hover would start the swap and reverse it a frame later. The swap waits
 * for the width animation (`duration.slow`, 300ms), so a click leaves the logo alone.
 */
function useRailSettled(collapsed: boolean) {
  const [settled, setSettled] = React.useState(collapsed)
  const [seen, setSeen] = React.useState(collapsed)
  // A toggle starts the wait again; adjusting state while rendering avoids an effect that sets it.
  if (seen !== collapsed) {
    setSeen(collapsed)
    setSettled(false)
  }
  React.useEffect(() => {
    if (!collapsed || settled) return undefined
    const timer = setTimeout(() => setSettled(true), 320)
    return () => clearTimeout(timer)
  }, [collapsed, settled])
  return settled
}

export function Sidebar() {
  const m = useMessages()
  const id = React.useId()
  const navId = `${id}-nav`
  const collapsed = useSelector(sidebarCollapsed)
  const toggle = sidebarStore.actions.setCollapsed
  const navGroups = groups(m)
  const settled = useRailSettled(collapsed)

  return (
    <aside {...stylex.props(styles.root, collapsed && styles.rootCollapsed)}>
      {/* Collapsed, the whole strip is the hover target that swaps the logo for the expand icon. */}
      {/* One header for both states, so a toggle only moves and fades what is already there: the
            logo stays where it is, the wordmark fades, and the toggle rides the sidebar's edge
            (the rail is 64px wide, so the same logo sits on the icon column in both). One
            button in one position also keeps a keyboard user's focus through a toggle. */}
      <div {...stylex.props(styles.header, stylex.defaultMarker())}>
        {/* Not a link: the Overview item already leads to `/admin`. */}
        <span {...stylex.props(layout.brand, styles.brand)}>
          <span {...stylex.props(collapsed && settled && styles.logoRail)}>
            <Logo />
          </span>
          <span
            aria-hidden={collapsed || undefined}
            {...stylex.props(styles.wordmark, collapsed && styles.faded)}
          >
            Rusttp
          </span>
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label={m.admin_sidebar_toggle()}
                aria-expanded={!collapsed}
                aria-controls={navId}
                onClick={() => toggle(!collapsed)}
                style={[styles.trigger, collapsed && styles.triggerRail]}
              />
            }
          >
            <span {...stylex.props(styles.swap)}>
              <span {...stylex.props(styles.swapClose, collapsed && styles.faded)}>
                <Icon svg={PanelLeftClose} size={16} />
              </span>
              <span {...stylex.props(styles.swapOpen, collapsed && settled && styles.swapOpenRail)}>
                <Icon svg={PanelLeftOpen} size={16} />
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent side='right'>
            {collapsed ? m.admin_sidebar_expand() : m.admin_sidebar_collapse()}
          </TooltipContent>
        </Tooltip>
      </div>

      <div {...stylex.props(styles.search)}>
        <CommandBarTrigger collapsed={collapsed} />
      </div>

      <nav
        id={navId}
        aria-label={m.admin_nav_landmark()}
        {...stylex.props(styles.nav, styles.navUnderSearch)}
      >
        {navGroups.map(({ label, items }) => (
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

      {/* Room for the bell above the account strip; it opens and closes with the width. */}
      <div
        aria-hidden='true'
        {...stylex.props(styles.notifyRoom, collapsed && styles.notifyRoomOpen)}
      />

      <div {...stylex.props(styles.account)}>
        <AdminUserMenu collapsed={collapsed} />
      </div>

      <NotifyEntry collapsed={collapsed} />
    </aside>
  )
}
