import {
  ArrowLeft,
  Bell,
  Keyboard,
  LogOut,
  RotateCcw,
  Search,
  SlidersHorizontal
} from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import {
  type AppHotkeyId,
  HotkeysProvider,
  useAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
  useFormatForDisplay,
  useHotkey,
  useHotkeyHint,
  useHotkeyRecorder
} from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { Button } from 'uilibs/base/button'
import { Separator } from 'uilibs/base/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from 'uilibs/base/tooltip'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from 'uilibs/extra/command'
import { Icon } from 'uilibs/extra/icon'
import { useTheme } from 'uilibs/theme'
import { AppShortcut, Shortcut, ariaKeyShortcuts } from '#/components/shortcut'
import { useNotifications } from '#/libraries/notifications'
import { styles } from '#/styles/element/commandbar.stylex'
import { groups as navGroups } from './-nav'
import { accountItems, appItems, signOutTo, themes } from './-user-menu'
import { groups as settingsGroups } from './settings/-nav'

// The command bar: one dialog that runs a command by name (Cmd+K on macOS, Ctrl+K elsewhere), with a
// keyboard-shortcuts panel inside it that lists every declared shortcut and records a new one.
//
// While it is open its scope is exclusive, so the page's own hotkeys (`G O`, Cmd+B, …) are suspended
// and typing a command never navigates; they come back when it closes.

interface CommandEntry {
  value: string
  /** What the row says: a page's name, or `Settings → Sessions` for a settings page. */
  label: string
  /** Extra words the search also matches (the group a page sits in), never shown. */
  keywords: string
  group: string
  icon: React.ComponentType
  /** An app hotkey whose binding is shown beside the command. */
  hotkey?: AppHotkeyId
  run: () => void
}

type Panel = 'commands' | 'shortcuts'

/** The admin's global shortcuts. Lives under the admin layout, so they work on every admin page. */
export function useAdminHotkeys({
  toggleSidebar,
  openCommandBar,
  openShortcuts
}: {
  toggleSidebar: () => void
  openCommandBar: () => void
  openShortcuts: () => void
}) {
  const navigate = useNavigate()
  const hotkeys = useAppHotkeys()

  // Registered with the user's binding for each id, and a rebinding takes effect at once.
  useHotkey(hotkeys['palette.toggle'], openCommandBar)
  useHotkey(hotkeys['help.shortcuts'], openShortcuts)
  useHotkey(hotkeys['sidebar.toggle'], toggleSidebar)
  useHotkey(hotkeys['nav.overview'], () => void navigate({ to: '/admin' }))
  useHotkey(hotkeys['nav.users'], () => void navigate({ to: '/admin/users' }))
  useHotkey(hotkeys['nav.notifications'], () => void navigate({ to: '/admin/notifications' }))
  useHotkey(hotkeys['nav.settings'], () => void navigate({ to: '/admin/settings' }))
}

/**
 * The sidebar's search-like trigger. It shows its shortcut as keycaps beside the label, and while
 * the user holds the shortcut's modifier the keycaps are the hint (`useHotkeyHint`) that the key
 * under their finger does something.
 */
export function CommandBarTrigger({
  collapsed,
  onOpen
}: {
  collapsed: boolean
  onOpen: () => void
}) {
  const appHotkey = useAppHotkeys()['palette.toggle']
  const holding = useHotkeyHint(appHotkey)

  const button = (
    <Button
      variant='outline'
      size={collapsed ? 'icon-md' : 'md'}
      aria-label='Search and commands'
      aria-keyshortcuts={ariaKeyShortcuts(appHotkey.hotkey)}
      onClick={onOpen}
      style={[styles.trigger, collapsed && styles.triggerRail]}
    >
      <Icon svg={Search} size={collapsed ? 16 : 14} />
      {/* The rail has room for the icon only: the word and the keys are the tooltip there. */}
      {!collapsed && (
        <>
          <span {...stylex.props(styles.triggerLabel)}>Search</span>
          <Shortcut
            hotkey={appHotkey.hotkey}
            hidden
            style={[styles.triggerKeys, !holding && styles.triggerKeysQuiet]}
          />
        </>
      )}
    </Button>
  )

  if (!collapsed) return button

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side='right'>
        Search <Shortcut hotkey={appHotkey.hotkey} hidden style={styles.tipKeys} />
      </TooltipContent>
    </Tooltip>
  )
}

export function CommandBar({
  open,
  panel,
  onOpenChange,
  onPanelChange
}: {
  open: boolean
  panel: Panel
  onOpenChange: (open: boolean) => void
  onPanelChange: (panel: Panel) => void
}) {
  // The overlay owns the keyboard while it is mounted: its scope is exclusive, so every hotkey on
  // the page behind it is suspended. It is mounted only while open, so the scope is too.
  return open ? (
    <HotkeysProvider scope='commandbar' exclusive>
      <CommandBarDialog panel={panel} onOpenChange={onOpenChange} onPanelChange={onPanelChange} />
    </HotkeysProvider>
  ) : null
}

function CommandBarDialog({
  panel,
  onOpenChange,
  onPanelChange
}: {
  panel: Panel
  onOpenChange: (open: boolean) => void
  onPanelChange: (panel: Panel) => void
}) {
  const navigate = useNavigate()
  const hotkeys = useAppHotkeys()
  const { unread } = useNotifications()
  const { setTheme } = useTheme()

  const go = (to: string) => () => void navigate({ to })
  // Every page the sidebar links to, in its order, so a page added to `-nav.ts` is searchable at
  // once; a few of them have a go-to sequence to show.
  const shortcuts: Partial<Record<string, AppHotkeyId>> = {
    '/admin': 'nav.overview',
    '/admin/users': 'nav.users',
    '/admin/notifications': 'nav.notifications',
    '/admin/settings': 'nav.settings'
  }
  const pages = navGroups.flatMap(({ label, items }) =>
    items.flatMap((item): CommandEntry[] => {
      const { to } = item
      if (!to) return []
      return [
        {
          value: to,
          label: item.label,
          keywords: label ?? '',
          group: 'Go to',
          icon: item.icon,
          hotkey: shortcuts[to],
          run: go(to)
        }
      ]
    })
  )
  // Notifications is reached from the bell, not the sidebar's list, so `-nav.ts` does not have it:
  // it is added here, first after the Overview, since it is the page people come back to most, and
  // is as easy to reach by name or by `G N` as any of them.
  const notifications: CommandEntry = {
    value: '/admin/notifications',
    label: 'Notifications',
    keywords: 'alerts inbox bell messages unread',
    group: 'Go to',
    icon: Bell,
    hotkey: 'nav.notifications',
    run: go('/admin/notifications')
  }
  // The settings pages are a second level the sidebar only shows on the settings screen, so they
  // are listed here as `Settings → Page`: the quickest way to reach one from anywhere.
  const settings = settingsGroups.flatMap(({ items }) =>
    items.flatMap((page): CommandEntry[] => {
      const { to } = page
      if (!to) return []
      return [
        {
          value: to,
          label: `Settings → ${page.label}`,
          // The settings group's name is not a keyword: `Security` would put Protection and Blocklist
          // above the Security page in the account menu, and a page's own name should win.
          keywords: 'preferences configuration',
          group: 'Settings',
          icon: SlidersHorizontal,
          run: go(to)
        }
      ]
    })
  )
  const themeKeywords: Record<string, string> = {
    light: 'bright day',
    dark: 'night',
    system: 'auto device'
  }
  // The account menu's links, as the menu has them: where to go, the theme, and signing out.
  const account: CommandEntry[] = [
    ...[...accountItems, ...appItems].map((item): CommandEntry => ({
      value: item.to,
      label: item.label,
      keywords: 'account profile user menu',
      group: 'Account',
      icon: item.icon,
      run: go(item.to)
    })),
    ...themes.map((item): CommandEntry => ({
      value: `theme-${item.value}`,
      label: `Theme → ${item.label}`,
      // Only what is true of this theme: a shared word (`dark`, `system`) would match all three and
      // Enter would pick the first. `appearance` is the one word that finds the group.
      keywords: `appearance ${themeKeywords[item.value] ?? ''}`,
      group: 'Account',
      icon: item.icon,
      run: () => setTheme(item.value)
    })),
    {
      value: 'sign-out',
      label: 'Sign out',
      keywords: 'log out logout leave',
      group: 'Account',
      icon: LogOut,
      run: go(signOutTo)
    }
  ]
  const help: CommandEntry[] = [
    {
      value: 'shortcuts',
      label: 'Keyboard shortcuts',
      keywords: 'hotkeys keys help bindings',
      group: 'Help',
      icon: Keyboard,
      hotkey: 'help.shortcuts',
      run: () => onPanelChange('shortcuts')
    }
  ]
  const [overview, ...otherPages] = pages
  const commands = [
    ...(overview ? [overview] : []),
    notifications,
    ...otherPages,
    ...settings,
    ...account,
    ...help
  ]
  const groups = [...new Set(commands.map((command) => command.group))].map((label) => ({
    value: label,
    label,
    items: commands.filter((command) => command.group === label)
  }))
  const unreadLabel = `${unread} unread`

  // Escape closes the palette (or steps back from the panel), and the shortcut that opened it
  // closes it again: the page's registration of both is suspended while this scope is exclusive.
  useHotkey('Escape', () =>
    panel === 'shortcuts' ? onPanelChange('commands') : onOpenChange(false)
  )
  useHotkey(hotkeys['palette.toggle'], () => onOpenChange(false))

  return (
    <CommandDialog
      open
      onOpenChange={onOpenChange}
      // Focus is not sent back to the sidebar trigger on close: the bar opens from a hotkey as
      // often as from the trigger, and a ring left on the trigger after Escape reads as a stuck
      // state. The page keeps whatever was focused before, or the body.
      finalFocus={false}
      title={panel === 'shortcuts' ? 'Keyboard shortcuts' : 'Command bar'}
      description={
        panel === 'shortcuts'
          ? 'Every shortcut, and a way to change each one.'
          : 'Search for a page or a command.'
      }
    >
      {panel === 'shortcuts' ? (
        <ShortcutsPanel onBack={() => onPanelChange('commands')} />
      ) : (
        <Command
          items={groups}
          // The search matches what a row says and the words it carries (its group, a synonym),
          // so `sessions`, `security`, or `hotkeys` all find their page.
          itemToStringValue={(item) =>
            typeof item === 'object' && item && 'label' in item
              ? `${String(item.label)} ${'keywords' in item ? String(item.keywords) : ''}`
              : ''
          }
        >
          <CommandInput
            placeholder='Search pages, settings, and commands…'
            aria-label='Search pages, settings, and commands'
          />
          <CommandEmpty>
            <span {...stylex.props(styles.emptyTitle)}>Nothing matches</span>
            <span {...stylex.props(styles.emptyHint)}>
              Try a page name, or a word like “sessions” or “shortcuts”.
            </span>
          </CommandEmpty>
          <CommandList aria-label='Pages and commands'>
            {(group: (typeof groups)[number], index: number) => (
              <React.Fragment key={group.value}>
                {/* A rule between groups, so it leads every group but the first shown: the list
                    is the filtered one, and a rule after the last would sit on the footer's. */}
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={group.label}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item}
                      onClick={() => {
                        // Selecting a command closes the bar first, then runs it on the page.
                        if (item.value !== 'shortcuts') onOpenChange(false)
                        item.run()
                      }}
                    >
                      <span {...stylex.props(styles.itemIcon)}>
                        <Icon svg={item.icon} size={16} color='neutralFaded' />
                      </span>
                      <span {...stylex.props(styles.itemLabel)}>
                        {item.label}
                        {item.value === '/admin/notifications' && unread > 0 && (
                          <span {...stylex.props(styles.itemMeta)}>{unreadLabel}</span>
                        )}
                      </span>
                      {item.hotkey && (
                        <AppShortcut id={item.hotkey} hidden style={styles.itemKeys} />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            )}
          </CommandList>
          <Separator />
          <div aria-hidden='true' {...stylex.props(styles.footer)}>
            <span {...stylex.props(styles.footerHint)}>
              <Shortcut hotkey='ArrowUp' /> <Shortcut hotkey='ArrowDown' /> to move
            </span>
            {/* What happens to the highlighted row, and how to leave: on the end side, apart from the
                keys that move. */}
            <span {...stylex.props(styles.footerEnd)}>
              <span {...stylex.props(styles.footerHint)}>
                <Shortcut hotkey='Enter' /> to open
              </span>
              <span {...stylex.props(styles.footerHint)}>
                <Shortcut hotkey='Escape' /> to close
              </span>
            </span>
          </div>
        </Command>
      )}
    </CommandDialog>
  )
}

// What the recorder says when it turns a recording down, in the app's own words.
const rejections = {
  conflict: 'That shortcut is already in use.',
  validation: 'Use a modifier, or a key sequence.',
  whitespace: 'Space cannot be a shortcut.',
  'missing-code': 'That key cannot be recorded.',
  'alt-graph': 'AltGr cannot be recorded.'
} as const

function ShortcutsPanel({ onBack }: { onBack: () => void }) {
  const items = useAppHotkeyList()
  const groups = [...new Set(items.map(({ appHotkey }) => appHotkey.meta?.group ?? 'Other'))]
  const [editing, setEditing] = React.useState<AppHotkeyId | null>(null)

  return (
    <div {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.panelHeader)}>
        <Button variant='ghost' size='icon-sm' aria-label='Back to commands' onClick={onBack}>
          <Icon svg={ArrowLeft} size={16} />
        </Button>
        <h2 {...stylex.props(styles.panelTitle)}>Keyboard shortcuts</h2>
      </div>
      <div {...stylex.props(styles.panelList)}>
        {groups.map((group) => (
          <section key={group} aria-label={group} {...stylex.props(styles.panelGroup)}>
            <h3 {...stylex.props(styles.panelGroupLabel)}>{group}</h3>
            {items
              .filter(({ appHotkey }) => (appHotkey.meta?.group ?? 'Other') === group)
              .map(({ appHotkey, isCustom }) => (
                <ShortcutRow
                  key={appHotkey.id}
                  id={appHotkey.id}
                  isCustom={isCustom}
                  editing={editing === appHotkey.id}
                  onEdit={(on) => setEditing(on ? appHotkey.id : null)}
                />
              ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function ShortcutRow({
  id,
  isCustom,
  editing,
  onEdit
}: {
  id: AppHotkeyId
  isCustom: boolean
  editing: boolean
  onEdit: (on: boolean) => void
}) {
  const formatForDisplay = useFormatForDisplay()
  const appHotkey = useAppHotkeys()[id]
  const { setCustomHotkey, resetCustomHotkey, findConflicts } = useCustomHotkeys()
  const [message, setMessage] = React.useState<string | null>(null)

  const recorder = useHotkeyRecorder({
    // A chord or a sequence: `G O` is as valid a binding as `Mod+K`.
    maxSteps: Infinity,
    idleTimeoutMs: 1500,
    // Reject a recording already taken by another registered hotkey (any scope); the app-hotkey
    // check in `validate` also covers shortcuts on pages that have not rendered.
    detectConflicts: true,
    validate: (hotkey, context) => {
      const conflicts = findConflicts(id, hotkey, context)
      return (
        conflicts.length === 0 ||
        `Already used by “${conflicts[0]?.meta?.name ?? 'another shortcut'}”.`
      )
    },
    onReject: ({ reason, message: why }) =>
      setMessage(reason === 'validation' && why ? why : rejections[reason]),
    onRecord: (hotkey, context) => {
      setCustomHotkey(id, hotkey, context)
      setMessage(null)
      onEdit(false)
    },
    onClear: () => {
      setCustomHotkey(id, null)
      setMessage(null)
      onEdit(false)
    },
    onCancel: () => {
      setMessage(null)
      onEdit(false)
    }
  })

  React.useEffect(() => {
    if (!editing && recorder.isRecording) recorder.cancelRecording()
  }, [editing, recorder])

  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.rowText)}>
        <span {...stylex.props(styles.rowName)}>{appHotkey.meta?.name}</span>
        {editing && recorder.isRecording && (
          <output {...stylex.props(styles.rowHint)}>
            {message ??
              (recorder.steps.length > 0
                ? `${formatForDisplay(recorder.steps)} then Enter`
                : 'Press the keys · Esc cancels · Backspace unbinds')}
          </output>
        )}
      </div>
      <div {...stylex.props(styles.rowKeys)}>
        {appHotkey.hotkey ? (
          <Shortcut hotkey={appHotkey.hotkey} />
        ) : (
          <span {...stylex.props(styles.unbound)}>Unassigned</span>
        )}
        <Button
          variant='ghost'
          size='sm'
          aria-label={`Change ${appHotkey.meta?.name ?? id} shortcut`}
          onClick={() => {
            onEdit(true)
            recorder.startRecording()
          }}
        >
          {editing && recorder.isRecording ? 'Recording…' : 'Change'}
        </Button>
        {isCustom && (
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={`Reset ${appHotkey.meta?.name ?? id} shortcut`}
            onClick={() => resetCustomHotkey(id)}
          >
            <Icon svg={RotateCcw} size={14} />
          </Button>
        )}
      </div>
    </div>
  )
}
