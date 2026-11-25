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
import { useSelector } from '@tanstack/react-store'
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
import { Stack } from 'uilibs/extra/stack'
import { useTheme } from 'uilibs/theme'
import { AppShortcut, Shortcut, ariaKeyShortcuts, useShortcutText } from '#/components/shortcut'
import { themes } from '#/components/theme-menu'
import { commandBarStore } from '#/libraries/commandbar.store'
import { hotkeyNames, localizedHotkeyName } from '#/libraries/hotkeys'
import { type Messages, useMessages } from '#/libraries/messages'
import { unreadCount } from '#/libraries/notifications.store'
import { sidebarStore } from '#/libraries/sidebar.store'
import { styles } from '#/styles/element/commandbar.stylex'
import { groups as navGroups } from './-nav'
import { accountItems, appItems, signOutTo } from './-user-menu'
import { groups as settingsGroups } from './settings/-nav'

// The command bar: one dialog that runs a command by name (Cmd+K on macOS, Ctrl+K elsewhere), with a
// keyboard-shortcuts panel inside it that lists every declared shortcut and records a new one.
//
// While it is open its scope is exclusive, so the page's own hotkeys (`G O`, Cmd+/, …) are suspended
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

/** The admin's global shortcuts. Lives under the admin layout, so they work on every admin page. */
export function useAdminHotkeys() {
  const navigate = useNavigate()
  const hotkeys = useAppHotkeys()

  // Registered with the user's binding for each id, and a rebinding takes effect at once.
  useHotkey(hotkeys['palette.toggle'], () => commandBarStore.actions.show('commands'))
  useHotkey(hotkeys['help.shortcuts'], () => commandBarStore.actions.show('shortcuts'))
  useHotkey(hotkeys['sidebar.toggle'], () => sidebarStore.actions.toggle())
  useHotkey(hotkeys['settings.open'], () => void navigate({ to: '/admin/settings' }))
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
export function CommandBarTrigger({ collapsed }: { collapsed: boolean }) {
  const m = useMessages()
  const appHotkey = useAppHotkeys()['palette.toggle']
  const holding = useHotkeyHint(appHotkey)
  const shortcutText = useShortcutText(appHotkey.hotkey)

  const button = (
    <Button
      variant='outline'
      size='medium'
      // The name is what the button shows (WCAG 2.5.3: a voice user says what they see); the longer
      // purpose is its description.
      aria-label={`${m.commandbar_search()} ${shortcutText}`.trim()}
      aria-description={m.commandbar_trigger()}
      aria-keyshortcuts={ariaKeyShortcuts(appHotkey.hotkey)}
      onClick={() => commandBarStore.actions.show('commands')}
      style={[styles.trigger, collapsed && styles.triggerRail]}
    >
      <Icon svg={Search} size={collapsed ? 16 : 14} />
      {/* The rail has room for the icon only: the word and the keys are the tooltip there. */}
      {!collapsed && (
        <>
          <span {...stylex.props(styles.triggerLabel)}>{m.commandbar_search()}</span>
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
        {m.commandbar_search()} <Shortcut hotkey={appHotkey.hotkey} hidden style={styles.tipKeys} />
      </TooltipContent>
    </Tooltip>
  )
}

export function CommandBar() {
  const open = useSelector(commandBarStore, (state) => state.open)
  // The dialog stays mounted and closed, so a change of `open` runs its enter and exit transitions
  // (a dialog mounted already open has no starting state to fade from). Its content mounts only
  // while it is open or fading out. The overlay owns the keyboard while it is open: its scope is
  // exclusive, so every hotkey on the page behind it is suspended, and `enabled` hands the keyboard
  // back the moment it closes, not when the fade ends.
  return (
    <HotkeysProvider scope='commandbar' exclusive enabled={open}>
      <CommandBarDialog open={open} />
    </HotkeysProvider>
  )
}

function CommandBarDialog({ open }: { open: boolean }) {
  const m = useMessages()
  // The content outlives `open` while the dialog fades out, so a bar reopened in that window would
  // keep the last query: it is cleared on every open instead of on unmount.
  const [query, setQuery] = React.useState('')
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setQuery('')
  }
  const panel = useSelector(commandBarStore, (state) => state.panel)
  const { setOpen: onOpenChange, show: onPanelChange } = commandBarStore.actions
  const panelRef = React.useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const hotkeys = useAppHotkeys()
  const unread = useSelector(unreadCount)
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
  const pages = navGroups(m).flatMap(({ label, items }) =>
    items.flatMap((item): CommandEntry[] => {
      const { to } = item
      if (!to) return []
      return [
        {
          value: to,
          label: item.label,
          keywords: label ?? '',
          group: m.commandbar_group_go_to(),
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
    label: m.notifications_title(),
    keywords: m.commandbar_keywords_notifications(),
    group: m.commandbar_group_go_to(),
    icon: Bell,
    hotkey: 'nav.notifications',
    run: go('/admin/notifications')
  }
  // The settings pages are a second level the sidebar only shows on the settings screen, so they
  // are listed here as `Settings → Page`: the quickest way to reach one from anywhere.
  const settings = settingsGroups(m).flatMap(({ items }) =>
    items.flatMap((page): CommandEntry[] => {
      const { to } = page
      if (!to) return []
      return [
        {
          value: to,
          label: m.commandbar_settings_item({ page: page.label }),
          // The settings group's name is not a keyword: `Security` would put Protection and Blocklist
          // above the Security page in the account menu, and a page's own name should win.
          keywords: m.commandbar_keywords_settings(),
          group: m.commandbar_group_settings(),
          icon: SlidersHorizontal,
          run: go(to)
        }
      ]
    })
  )
  const themeKeywords: Record<string, string> = {
    light: m.commandbar_keywords_theme_light(),
    dark: m.commandbar_keywords_theme_dark(),
    system: m.commandbar_keywords_theme_system()
  }
  // The account menu's links, as the menu has them: where to go, the theme, and signing out.
  const account: CommandEntry[] = [
    ...[...accountItems(m), ...appItems(m)].map((item): CommandEntry => ({
      value: item.to,
      label: item.label,
      keywords: m.commandbar_keywords_account(),
      group: m.commandbar_group_account(),
      icon: item.icon,
      run: go(item.to)
    })),
    ...themes(m).map((item): CommandEntry => ({
      value: `theme-${item.value}`,
      label: m.commandbar_theme_item({ name: item.label }),
      // Only what is true of this theme: a shared word (`dark`, `system`) would match all three and
      // Enter would pick the first. `appearance` is the one word that finds the group.
      keywords: themeKeywords[item.value] ?? '',
      group: m.commandbar_group_account(),
      icon: item.icon,
      run: () => setTheme(item.value)
    })),
    {
      value: 'sign-out',
      label: m.user_menu_sign_out(),
      keywords: m.commandbar_keywords_sign_out(),
      group: m.commandbar_group_account(),
      icon: LogOut,
      run: go(signOutTo)
    }
  ]
  const help: CommandEntry[] = [
    {
      value: 'shortcuts',
      label: m.commandbar_shortcuts_item(),
      keywords: m.commandbar_keywords_shortcuts(),
      group: m.commandbar_group_help(),
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
  const unreadLabel = m.commandbar_unread({ count: unread })

  // Escape closes the palette (or steps back from the panel), and the shortcut that opened it
  // closes it again: the page's registration of both is suspended while this scope is exclusive.
  useHotkey('Escape', () =>
    panel === 'shortcuts' ? onPanelChange('commands') : onOpenChange(false)
  )
  useHotkey(hotkeys['palette.toggle'], () => onOpenChange(false))

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      // Focus is not sent back to the sidebar trigger on close: the bar opens from a hotkey as
      // often as from the trigger, and a ring left on the trigger after Escape reads as a stuck
      // state. The page keeps whatever was focused before, or the body.
      finalFocus={false}
      // Opened straight onto the cheat sheet, focus lands on the panel itself, not on its Back
      // button: nothing there is meant to be typed in, so no control takes a ring on open.
      initialFocus={panel === 'shortcuts' ? panelRef : undefined}
      labels={{
        title: panel === 'shortcuts' ? m.shortcuts_title() : m.commandbar_title(),
        description:
          panel === 'shortcuts' ? m.commandbar_shortcuts_description() : m.commandbar_description()
      }}
    >
      {panel === 'shortcuts' ? (
        <ShortcutsPanel ref={panelRef} onBack={() => onPanelChange('commands')} />
      ) : (
        <Command
          items={groups}
          value={query}
          onValueChange={setQuery}
          // The search matches what a row says and the words it carries (its group, a synonym),
          // so `sessions`, `security`, or `hotkeys` all find their page.
          itemToStringValue={(item) =>
            typeof item === 'object' && item && 'label' in item
              ? `${String(item.label)} ${'keywords' in item ? String(item.keywords) : ''}`
              : ''
          }
        >
          <CommandInput
            placeholder={m.commandbar_placeholder()}
            aria-label={m.commandbar_placeholder_label()}
          />
          <CommandEmpty>
            <span {...stylex.props(styles.emptyTitle)}>{m.commandbar_empty_title()}</span>
            <span {...stylex.props(styles.emptyHint)}>{m.commandbar_empty_hint()}</span>
          </CommandEmpty>
          <CommandList aria-label={m.commandbar_list()}>
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
                        <Icon svg={item.icon} size={16} color='neutral-faded' />
                      </span>
                      <Stack
                        render={<span />}
                        direction='row'
                        align='baseline'
                        gap={2}
                        style={styles.itemLabel}
                      >
                        {item.label}
                        {item.value === '/admin/notifications' && unread > 0 && (
                          <span {...stylex.props(styles.itemMeta)}>{unreadLabel}</span>
                        )}
                      </Stack>
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
          <Stack aria-hidden='true' direction='row' align='center' gap={4} style={styles.footer}>
            <span {...stylex.props(styles.footerHint)}>
              <Shortcut hotkey='ArrowUp' /> <Shortcut hotkey='ArrowDown' />{' '}
              {m.commandbar_hint_move()}
            </span>
            {/* What happens to the highlighted row, and how to leave: on the end side, apart from the
                keys that move. */}
            <span {...stylex.props(styles.footerEnd)}>
              <span {...stylex.props(styles.footerHint)}>
                <Shortcut hotkey='Enter' /> {m.commandbar_hint_open()}
              </span>
              <span {...stylex.props(styles.footerHint)}>
                <Shortcut hotkey='Escape' /> {m.commandbar_hint_close()}
              </span>
            </span>
          </Stack>
        </Command>
      )}
    </CommandDialog>
  )
}

// What the recorder says when it turns a recording down, in the app's own words.
const rejections = (m: Messages) =>
  ({
    conflict: m.shortcuts_reject_conflict(),
    validation: m.shortcuts_reject_validation(),
    whitespace: m.shortcuts_reject_whitespace(),
    'missing-code': m.shortcuts_reject_missing_code(),
    'alt-graph': m.shortcuts_reject_alt_graph()
  }) as const

// The cheat sheet's groups are declared in English (`meta.group`); this is what each is called.
const groupNames = (m: Messages): Record<string, string> => ({
  General: m.shortcuts_group_general(),
  Navigation: m.shortcuts_group_navigation(),
  Other: m.shortcuts_group_other()
})

function ShortcutsPanel({ ref, onBack }: { ref: React.Ref<HTMLDivElement>; onBack: () => void }) {
  const m = useMessages()
  const items = useAppHotkeyList()
  const names = groupNames(m)
  const groupId = React.useId()
  const groups = [...new Set(items.map(({ appHotkey }) => appHotkey.meta?.group ?? 'Other'))]
  const [editing, setEditing] = React.useState<AppHotkeyId | null>(null)

  return (
    <Stack ref={ref} tabIndex={-1} style={styles.panel}>
      <Stack direction='row' align='center' gap={2} style={styles.panelHeader}>
        <Button
          variant='ghost'
          size='small'
          icon={ArrowLeft}
          aria-label={m.shortcuts_back()}
          onClick={onBack}
        />
        <h2 {...stylex.props(styles.panelTitle)}>{m.shortcuts_title()}</h2>
      </Stack>
      <div {...stylex.props(styles.panelList)}>
        {groups.map((group) => (
          <Stack
            key={group}
            render={<section aria-labelledby={`${groupId}-${group}`} />}
            style={styles.panelGroup}
          >
            <h3 id={`${groupId}-${group}`} {...stylex.props(styles.panelGroupLabel)}>
              {names[group] ?? group}
            </h3>
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
          </Stack>
        ))}
      </div>
    </Stack>
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
  const m = useMessages()
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
        m.shortcuts_conflict({
          name: localizedHotkeyName(m, conflicts[0]?.meta?.name) ?? m.shortcuts_conflict_other()
        })
      )
    },
    onReject: ({ reason, message: why }) =>
      setMessage(reason === 'validation' && why ? why : rejections(m)[reason]),
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
    <Stack direction='row' align='center' justify='space-between' gap={3} style={styles.row}>
      <Stack style={styles.rowText}>
        <span {...stylex.props(styles.rowName)}>{hotkeyNames(m)[id]}</span>
        {editing && recorder.isRecording && (
          <output {...stylex.props(styles.rowHint)}>
            {message ??
              (recorder.steps.length > 0
                ? m.shortcuts_recording_steps({ keys: formatForDisplay(recorder.steps) })
                : m.shortcuts_recording_hint())}
          </output>
        )}
      </Stack>
      <Stack direction='row' align='center' gap={1} style={styles.rowKeys}>
        {appHotkey.hotkey ? (
          <Shortcut hotkey={appHotkey.hotkey} />
        ) : (
          <span {...stylex.props(styles.unbound)}>{m.shortcuts_unassigned()}</span>
        )}
        <Button
          variant='ghost'
          size='small'
          aria-label={m.shortcuts_change_named({ name: hotkeyNames(m)[id] })}
          onClick={() => {
            onEdit(true)
            recorder.startRecording()
          }}
        >
          {editing && recorder.isRecording ? m.shortcuts_recording() : m.shortcuts_change()}
        </Button>
        {isCustom && (
          <Button
            variant='ghost'
            size='small'
            icon={RotateCcw}
            aria-label={m.shortcuts_reset_named({ name: hotkeyNames(m)[id] })}
            onClick={() => resetCustomHotkey(id)}
          />
        )}
      </Stack>
    </Stack>
  )
}
