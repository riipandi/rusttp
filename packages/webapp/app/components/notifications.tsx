import {
  ArrowRight,
  Bell,
  BookCheck,
  BookOpen,
  CircleAlert,
  Clock,
  Inbox,
  Mail,
  MailOpen,
  UserPlus,
  X
} from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, type LinkProps } from '@tanstack/react-router'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from 'uilibs/base/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from 'uilibs/base/tooltip'
import { Badge } from 'uilibs/extra/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'uilibs/extra/empty'
import { Icon } from 'uilibs/extra/icon'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from 'uilibs/extra/item'
import { fontSize } from 'uilibs/styles/tokens.stylex.js'
import { visuallyHidden } from 'uilibs/styles/utils.stylex'
import {
  type NotificationItem,
  type NotificationKind,
  useNotifications
} from '#/libraries/notifications'
import { styles } from '#/styles/element/notifications.stylex'

const kinds: Record<
  NotificationKind,
  { svg: React.ComponentType; color: React.ComponentProps<typeof Icon>['color'] }
> = {
  overdue: { svg: CircleAlert, color: 'critical' },
  due: { svg: Clock, color: 'warning' },
  member: { svg: UserPlus, color: 'primary' },
  returned: { svg: BookCheck, color: 'positive' },
  reserved: { svg: BookOpen, color: 'neutralFaded' }
}

function Row({ item }: { item: NotificationItem }) {
  const { setRead, dismiss } = useNotifications()
  const { svg, color } = kinds[item.kind]

  return (
    <Item size='xs' style={[styles.row, !item.read && styles.rowUnread]}>
      <ItemMedia style={styles.media}>
        <Icon svg={svg} size={16} color={color} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle style={[styles.title, item.read && styles.titleRead]}>
          {!item.read && <span {...stylex.props(visuallyHidden.root)}>Unread: </span>}
          {item.title}
        </ItemTitle>
        <ItemDescription style={styles.body}>{item.body}</ItemDescription>
        <div {...stylex.props(styles.meta)}>
          <span {...stylex.props(styles.time)}>{item.time}</span>
          <div {...stylex.props(styles.actions)}>
            <Button
              variant='ghost'
              size='icon-sm'
              aria-label={item.read ? `Mark ${item.title} as unread` : `Mark ${item.title} as read`}
              onClick={() => setRead(item.id, !item.read)}
              style={styles.action}
            >
              <Icon svg={item.read ? Mail : MailOpen} size={16} />
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              aria-label={`Dismiss ${item.title}`}
              onClick={() => dismiss(item.id)}
              style={styles.action}
            >
              <Icon svg={X} size={16} />
            </Button>
          </div>
        </div>
      </ItemContent>
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
  collisionAvoidance?: React.ComponentProps<typeof PopoverContent>['collisionAvoidance']
}

/**
 * The notification bell and the popover it opens: the latest notifications with quick actions (mark
 * one read or unread, dismiss it, mark all read) and a link to the page with all of them. The
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
  collisionAvoidance
}: NotificationsPopoverProps) {
  const { items, unread, markAllRead } = useNotifications()
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
        sideOffset={12}
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
          <Button
            variant='ghost'
            size='sm'
            onClick={markAllRead}
            disabled={unread === 0}
            focusableWhenDisabled
          >
            Mark all read
          </Button>
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
