import { Menu } from '@keyline-icons/react'
import type { LayoutDashboard } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, type LinkProps, useRouterState } from '@tanstack/react-router'
import * as React from 'react'
import { Avatar, AvatarFallback } from 'uilibs/base/avatar'
import { Button, LinkButton } from 'uilibs/base/button'
import { CloseButton } from 'uilibs/base/dialog/close-button'
import { Separator } from 'uilibs/base/separator'
import { Icon } from 'uilibs/extra/icon'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from 'uilibs/extra/sheet'
import { styles } from '#/styles/element/nav-sheet.stylex'

export interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  /** Without a `to` the entry is a placeholder that does nothing until a route is wired in. */
  to?: LinkProps['to']
  /** Match `to` exactly; by default a nested page keeps its section active. */
  end?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export function useIsCurrent({ to, end }: Pick<NavItem, 'to' | 'end'>) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return (
    to !== undefined && to !== '/' && (pathname === to || (!end && pathname.startsWith(`${to}/`)))
  )
}

function SheetEntry({
  item,
  secondary,
  dense,
  onNavigate
}: {
  item: NavItem
  secondary?: boolean
  dense?: boolean
  onNavigate: () => void
}) {
  const current = useIsCurrent(item)
  const style = [
    styles.sheetItem,
    dense && styles.sheetItemDense,
    secondary && styles.sheetItemSecondary,
    secondary && dense && styles.sheetItemSecondaryDense,
    current && styles.sheetItemCurrent
  ]
  const content = (
    <>
      <Icon svg={item.icon} size={secondary || dense ? 16 : 18} />
      {item.label}
    </>
  )

  if (item.to) {
    return (
      <LinkButton
        render={<Link to={item.to} />}
        current={current}
        variant='ghost'
        size='lg'
        style={style}
        onClick={onNavigate}
      >
        {content}
      </LinkButton>
    )
  }

  return (
    <Button variant='ghost' size='lg' style={style}>
      {content}
    </Button>
  )
}

function SheetList({
  label,
  groups,
  secondary,
  dense,
  onNavigate
}: {
  label: string
  groups: NavGroup[]
  secondary?: boolean
  dense?: boolean
  onNavigate: () => void
}) {
  return (
    <nav aria-label={label} {...stylex.props(styles.sheetNav)}>
      {groups.map((group) => (
        <div
          key={group.label ?? 'main'}
          role={group.label ? 'group' : undefined}
          aria-label={group.label}
          {...stylex.props(styles.sheetGroup, dense && styles.sheetGroupDense)}
        >
          {group.label && (
            <span aria-hidden='true' {...stylex.props(styles.sheetGroupLabel)}>
              {group.label}
            </span>
          )}
          {group.items.map((item) => (
            <SheetEntry
              key={item.label}
              item={item}
              secondary={secondary}
              dense={dense}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

/**
 * The navigation of the small-screen layouts, laid out like a mobile app drawer: a header, the
 * primary entries, and a footer pinned to the bottom. The header is the account (`profile`) or the
 * bare `brand`; the footer is the quieter `account` entries or a `footer` node of the host's own,
 * such as the sidebar's account menu. The host places the trigger with `triggerStyle` (and hides it
 * where its own navigation shows). `dense` shrinks the entries for a long menu.
 */
export function NavSheet({
  label,
  profile,
  brand,
  groups,
  account,
  footer,
  dense,
  triggerStyle
}: {
  /** Names the primary navigation landmark. */
  label: string
  profile?: { name: string; email: string; initials: string }
  brand?: React.ReactNode
  groups: NavGroup[]
  account?: NavItem[]
  footer?: React.ReactNode
  dense?: boolean
  triggerStyle?: stylex.StyleXStyles
}) {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)
  // Links in the host's `footer` (the account menu) cannot reach `close`, so any navigation closes it.
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [openedAt, setOpenedAt] = React.useState(pathname)
  if (pathname !== openedAt) {
    setOpenedAt(pathname)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant='ghost'
            size='icon-md'
            aria-label='Open navigation'
            style={[styles.trigger, triggerStyle]}
          />
        }
      >
        <Icon svg={Menu} size={20} />
      </SheetTrigger>
      <SheetContent side='left' showCloseButton={false} style={styles.sheetContent}>
        <SheetHeader style={[styles.sheetProfile, !profile && styles.sheetHeaderBrand]}>
          {profile ? (
            <>
              <div {...stylex.props(styles.sheetProfileTop)}>
                <Avatar size='md'>
                  <AvatarFallback>{profile.initials}</AvatarFallback>
                </Avatar>
                <SheetClose render={<CloseButton style={styles.sheetClose} />} />
              </div>
              <SheetTitle style={styles.sheetName}>{profile.name}</SheetTitle>
              <SheetDescription style={styles.sheetEmail}>{profile.email}</SheetDescription>
            </>
          ) : (
            <div {...stylex.props(styles.sheetProfileTop)}>
              <SheetTitle style={styles.sheetBrand}>{brand}</SheetTitle>
              <SheetClose render={<CloseButton style={styles.sheetClose} />} />
            </div>
          )}
        </SheetHeader>
        <SheetList label={label} groups={groups} dense={dense} onNavigate={close} />
        <SheetFooter style={styles.sheetFooter}>
          <Separator style={styles.sheetSeparator} />
          {account ? (
            <SheetList
              label='Account'
              groups={[{ items: account }]}
              secondary
              dense={dense}
              onNavigate={close}
            />
          ) : (
            <div {...stylex.props(styles.sheetFooterSlot)}>{footer}</div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
