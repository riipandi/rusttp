import { defineAppHotkeys } from '@tanstack/react-hotkeys'
import { m } from '#/paraglide/messages'

// Every keyboard shortcut of the admin, declared in one place so the cheat sheet lists them all
// (even before the page that handles one has rendered) and a user's rebinding can be saved by id.
// Declarations only, no components or handlers: the callbacks are attached where the work happens
// (`useHotkey(appHotkeys['…'], …)`). Ids are a stable contract: saved custom hotkeys key on them.
//
// `Mod` is Command on macOS and Control on Windows and Linux. Bindings follow the character that is
// pressed (`Mod+K`); a physical `[Code]` binding is for a key whose position matters, which none of
// these does. A sequence (`['G', 'O']`) is pressed one key after another.
export const appHotkeys = defineAppHotkeys({
  'palette.toggle': { hotkey: 'Mod+K', meta: { name: 'Open the command bar', group: 'General' } },
  // Shift turns `/` into `?` on a US layout; like `settings.open`, it matches the physical Slash key.
  'help.shortcuts': {
    hotkey: 'Mod+Shift+/',
    meta: { name: 'Keyboard shortcuts', group: 'General' }
  },
  'sidebar.toggle': {
    hotkey: 'Mod+B',
    meta: { name: 'Expand or collapse the sidebar', group: 'General' }
  },
  // Shift turns `,` into `<` on a US layout; the library falls back to the physical Comma key, so
  // the shortcut works on every layout. It is the General counterpart of `G S`.
  'settings.open': {
    hotkey: 'Mod+Shift+,',
    meta: { name: 'Open settings', group: 'General' }
  },
  'nav.overview': { hotkey: ['G', 'O'], meta: { name: 'Go to Overview', group: 'Navigation' } },
  'nav.users': { hotkey: ['G', 'U'], meta: { name: 'Go to Users', group: 'Navigation' } },
  'nav.notifications': {
    hotkey: ['G', 'N'],
    meta: { name: 'Go to Notifications', group: 'Navigation' }
  },
  'nav.settings': { hotkey: ['G', 'S'], meta: { name: 'Go to Settings', group: 'Navigation' } }
})

// What the cheat sheet says for each hotkey, by id. `meta.name` above stays English: it is what the
// library hands back (a conflict, the recorder), and `localizedHotkeyName` maps it back to a message.
export const hotkeyNames = {
  'palette.toggle': m.hotkey_palette_toggle,
  'help.shortcuts': m.hotkey_help_shortcuts,
  'sidebar.toggle': m.hotkey_sidebar_toggle,
  'settings.open': m.hotkey_settings_open,
  'nav.overview': m.hotkey_nav_overview,
  'nav.users': m.hotkey_nav_users,
  'nav.notifications': m.hotkey_nav_notifications,
  'nav.settings': m.hotkey_nav_settings
} satisfies Record<keyof typeof appHotkeys, () => string>

/** The message for a hotkey the library names by its English `meta.name`; `undefined` when unknown. */
export function localizedHotkeyName(name: string | undefined) {
  const id = Object.entries(appHotkeys).find(([, hotkey]) => hotkey.meta?.name === name)?.[0]
  const names: Record<string, () => string> = hotkeyNames
  return id ? names[id]?.() : undefined
}

declare module '@tanstack/react-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
