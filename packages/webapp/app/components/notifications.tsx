import { ArrowRight, Bell, Inbox, Mail, MailOpen, MoreHorizontal, X } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, type LinkProps } from '@tanstack/react-router'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from 'uilibs/base/dropdown-menu'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from 'uilibs/base/popover'
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
import { type NotificationItem, useNotifications } from '#/libraries/notifications'
import { styles } from '#/styles/element/notifications.stylex'

// The quick actions live in a menu at the row's top-right corner, so the text keeps the whole row.
function Row({ item }: { item: NotificationItem }) {
  const { setRead, dismiss } = useNotifications()

  return (
    <Item size='xs' style={styles.row}>
      {!item.read && <span aria-hidden='true' {...stylex.props(styles.unreadDot)} />}
      <ItemContent style={styles.content}>
        <ItemTitle style={[styles.title, item.read && styles.titleRead]}>
          {!item.read && <span {...stylex.props(visuallyHidden.root)}>Unread: </span>}
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
                aria-label={`Actions for ${item.title}`}
                style={styles.action}
              />
            }
          >
            <Icon svg={MoreHorizontal} size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='end'>
            <DropdownMenuItem style={styles.menuItem} onClick={() => setRead(item.id, !item.read)}>
              <Icon svg={item.read ? Mail : MailOpen} size={14} color='neutralFaded' />
              {item.read ? 'Mark as unread' : 'Mark as read'}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              style={styles.menuItem}
              onClick={() => dismiss(item.id)}
            >
              <Icon svg={X} size={14} />
              Dismiss
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
  side = 'bottom',
  align = 'end',
  tooltipSide = 'bottom',
  alignOffset,
  sideOffset = 12,
  collisionPadding,
  collisionAvoidance
}: NotificationsPopoverProps) {
  const { items, unread, markAllRead, dismissAll } = useNotifications()
  const [open, setOpen] = React.useState(false)
  const name = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={<PopoverTrigger render={React.cloneElement(trigger, { 'aria-label': name })} />}
        >
          <span {...stylex.props(styles.bell)}>
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
            <PopoverTitle>Notifications</PopoverTitle>
            {unread > 0 && (
              <Badge variant='secondary' tone='primary'>
                {unread} new
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label='Notification actions'
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
                Mark all read
              </DropdownMenuItem>
              <DropdownMenuItem
                variant='destructive'
                style={styles.menuItem}
                disabled={items.length === 0}
                onClick={dismissAll}
              >
                <Icon svg={X} size={14} />
                Dismiss all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {items.length > 0 ? (
          <ItemGroup style={styles.list}>
            {items.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ItemGroup>
        ) : (
          <Empty style={styles.empty}>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Icon svg={Inbox} size={20} color='neutralFaded' />
              </EmptyMedia>
              <EmptyTitle>You are all caught up</EmptyTitle>
              <EmptyDescription>New activity at the library shows up here.</EmptyDescription>
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
            View all notifications
            <Icon svg={ArrowRight} size={14} />
          </LinkButton>
        </div>
      </PopoverContent>
    </Popover>
  )
}
