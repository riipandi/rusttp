import { ArrowRight, Bell, Inbox, Mail, MailOpen, MoreHorizontal, X } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, type LinkProps } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from 'uilibs/base/dropdown-menu'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from 'uilibs/base/popover'
import { ScrollArea } from 'uilibs/base/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from 'uilibs/base/tooltip'
import { Badge } from 'uilibs/extra/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'uilibs/extra/empty'
import { Icon } from 'uilibs/extra/icon'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from 'uilibs/extra/item'
import { visuallyHidden } from 'uilibs/styles/utils.stylex'
import { notificationsStore, unreadCount } from '#/libraries/notifications.store'
import { m } from '#/paraglide/messages'
import type { NotificationResponse } from '#/schemas/notifications.schema'
import { styles } from '#/styles/element/notifications.stylex'

// The quick actions live in a menu at the row's top-right corner, so the text keeps the whole row.
function Row({ item }: { item: NotificationResponse }) {
  const { setRead, dismiss } = notificationsStore.actions

  return (
    <Item size='xs' style={styles.row}>
      {!item.read && <span aria-hidden='true' {...stylex.props(styles.unreadBar)} />}
      <ItemContent style={styles.content}>
        <ItemTitle style={[styles.title, item.read && styles.titleRead]}>
          {!item.read && (
            <span {...stylex.props(visuallyHidden.root)}>{m.notifications_unread_prefix()}</span>
          )}
          {item.title}
        </ItemTitle>
        <ItemDescription style={styles.body}>{item.body}</ItemDescription>
        <span {...stylex.props(styles.time)}>{item.time}</span>
      </ItemContent>
      <ItemActions style={styles.actions}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label={m.notifications_row_actions({ title: item.title })}
                style={styles.action}
              />
            }
          >
            <Icon svg={MoreHorizontal} size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='end'>
            <DropdownMenuItem style={styles.menuItem} onClick={() => setRead(item.id, !item.read)}>
              <Icon svg={item.read ? Mail : MailOpen} size={14} color='neutralFaded' />
              {item.read ? m.notifications_mark_unread() : m.notifications_mark_read()}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              style={styles.menuItem}
              onClick={() => dismiss(item.id)}
            >
              <Icon svg={X} size={14} />
              {m.notifications_dismiss()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  )
}

interface NotificationsPopoverProps {
  /** The page that lists every notification, linked from the popover's footer. */
  to: LinkProps['to']
  /** The bell's button: a `Button` element whose size and style the host picks. */
  trigger: React.ReactElement<{ 'aria-label'?: string }>
  iconSize?: number
  /** Extra style on the bell icon's wrapper, for a host that animates it (the sidebar's rail). */
  iconStyle?: stylex.StyleXStyles
  /** Where the popover opens, and where the bell's own tooltip does. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
  /** Shifts the popover along its edge of the bell, in pixels. */
  alignOffset?: number
  /** Distance from the bell, in pixels. */
  sideOffset?: number
  /** Keeps the popover this far from the viewport's edges when it has to shift. */
  collisionPadding?: number
  collisionAvoidance?: React.ComponentProps<typeof PopoverContent>['collisionAvoidance']
}

/**
 * The notification bell and the popover it opens: the latest notifications with quick actions (mark
 * one read or unread, dismiss it; mark all read or dismiss all from the header menu) and a link to the page with all of them. The
 * bell carries a dot while anything is unread, and its name says how many.
 */
export function NotificationsPopover({
  to,
  trigger,
  iconSize = 20,
  iconStyle,
  side = 'bottom',
  align = 'end',
  tooltipSide = 'bottom',
  alignOffset,
  sideOffset = 12,
  collisionPadding,
  collisionAvoidance
}: NotificationsPopoverProps) {
  const items = useSelector(notificationsStore)
  const unread = useSelector(unreadCount)
  const { markAllRead, dismissAll } = notificationsStore.actions
  const [open, setOpen] = React.useState(false)
  const name =
    unread > 0 ? m.notifications_title_unread({ count: unread }) : m.notifications_title()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={<PopoverTrigger render={React.cloneElement(trigger, { 'aria-label': name })} />}
        >
          <span {...stylex.props(styles.bell, iconStyle)}>
            <Icon svg={Bell} size={iconSize} />
            {unread > 0 && <span aria-hidden='true' {...stylex.props(styles.dot)} />}
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{name}</TooltipContent>
      </Tooltip>

      <PopoverContent
        side={side}
        align={align}
        alignOffset={alignOffset}
        collisionAvoidance={collisionAvoidance}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        style={styles.panel}
      >
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.heading)}>
            <PopoverTitle>{m.notifications_title()}</PopoverTitle>
            {unread > 0 && (
              <Badge variant='secondary' tone='primary'>
                {m.notifications_new_count({ count: unread })}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label={m.notifications_menu()}
                  style={styles.action}
                />
              }
            >
              <Icon svg={MoreHorizontal} size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent side='bottom' align='end'>
              <DropdownMenuItem
                style={styles.menuItem}
                disabled={unread === 0}
                onClick={markAllRead}
              >
                <Icon svg={MailOpen} size={14} color='neutralFaded' />
                {m.notifications_mark_all_read()}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant='destructive'
                style={styles.menuItem}
                disabled={items.length === 0}
                onClick={dismissAll}
              >
                <Icon svg={X} size={14} />
                {m.notifications_dismiss_all()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {items.length > 0 ? (
          <ScrollArea fade style={styles.scroll}>
            <ItemGroup style={styles.list}>
              {items.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </ItemGroup>
          </ScrollArea>
        ) : (
          <Empty style={styles.empty}>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Icon svg={Inbox} size={20} color='neutralFaded' />
              </EmptyMedia>
              <EmptyTitle>{m.notifications_empty_title()}</EmptyTitle>
              <EmptyDescription>{m.notifications_empty_description()}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <div {...stylex.props(styles.footer)}>
          <LinkButton
            render={<Link to={to} onClick={() => setOpen(false)} />}
            variant='ghost'
            size='sm'
            style={styles.footerLink}
          >
            {m.notifications_view_all()}
            <Icon svg={ArrowRight} size={14} />
          </LinkButton>
        </div>
      </PopoverContent>
    </Popover>
  )
}
