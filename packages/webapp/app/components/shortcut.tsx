import type * as stylex from '@stylexjs/stylex'
import {
  type Hotkey,
  detectPlatform,
  isHotkeySequence,
  parseHotkey,
  useAppHotkeys,
  useFormatForDisplay
} from '@tanstack/react-hotkeys'
import type { AppHotkeyId } from '@tanstack/react-hotkeys'
import { Kbd, KbdGroup } from 'uilibs/extra/kbd'

interface ShortcutProps {
  /** `Mod+K` is `⌘ K` on macOS and `Ctrl K` elsewhere; a sequence is one key after another. */
  hotkey: Hotkey | null | undefined
  /** Hides the keys from assistive technology when the control already names its shortcut. */
  hidden?: boolean
  style?: stylex.StyleXStyles
}

/**
 * A hotkey as `aria-keyshortcuts` writes it: `Meta+K` on macOS, `Control+K` elsewhere (`Mod` is not
 * a key name). A sequence is the keys pressed one after another, space separated.
 */
export function ariaKeyShortcuts(hotkey: Hotkey | null | undefined) {
  if (!hotkey) return undefined
  const platform = detectPlatform()
  const chord = (step: string) => {
    const { key, code, modifiers } = parseHotkey(step, platform)
    // Already canonical names (`Control`, `Alt`, `Shift`, `Meta`), with `Mod` resolved for the platform.
    const names = modifiers
    return [...names, key ?? code].join('+')
  }
  return (isHotkeySequence(hotkey) ? hotkey : [hotkey]).map(chord).join(' ')
}

/**
 * A hotkey as the words a control's accessible name can end with (`Search ⌘ K`): the same parts the
 * keycaps show, so the name contains the visible text (WCAG 2.5.3) and follows the user's binding.
 */
export function useShortcutText(hotkey: Hotkey | null | undefined) {
  const formatForDisplay = useFormatForDisplay()
  if (!hotkey) return ''
  const keys = isHotkeySequence(hotkey)
    ? formatForDisplay(hotkey, { parts: true }).flat()
    : formatForDisplay(hotkey, { parts: true })
  return keys.join(' ')
}

/** A hotkey as keycaps, labelled for the user's platform. */
export function Shortcut({ hotkey, hidden, style }: ShortcutProps) {
  const formatForDisplay = useFormatForDisplay()
  if (!hotkey) return null

  const keys = isHotkeySequence(hotkey)
    ? formatForDisplay(hotkey, { parts: true }).flat()
    : formatForDisplay(hotkey, { parts: true })

  return (
    <KbdGroup aria-hidden={hidden || undefined} style={style}>
      {keys.map((key, step) => (
        // A key repeats in a hotkey (`G G`), so its position in the hotkey is part of its identity.
        // oxlint-disable-next-line react/no-array-index-key -- the hotkey's keys have no other id
        <Kbd key={`${step}${key}`}>{key}</Kbd>
      ))}
    </KbdGroup>
  )
}

/** The shortcut an app hotkey has now: the user's own binding when they changed it. */
export function AppShortcut({ id, ...props }: Omit<ShortcutProps, 'hotkey'> & { id: AppHotkeyId }) {
  return <Shortcut hotkey={useAppHotkeys()[id].hotkey} {...props} />
}
