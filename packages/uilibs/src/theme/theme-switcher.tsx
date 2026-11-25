import { Monitor, Moon, Sun } from '@keyline-icons/react'
import { Button } from '../base/button'
import { useTheme } from './theme'

const cycle: Record<string, string> = { light: 'dark', dark: 'system', system: 'light' }

/** Accessible names of the switcher's button: it names the theme a press switches to. */
export interface ThemeSwitcherLabels {
  /** Shown while the theme is light. Defaults to `Switch to dark mode`. */
  toDark: string
  /** Shown while the theme is dark. Defaults to `Switch to system mode`. */
  toSystem: string
  /** Shown while the theme follows the system. Defaults to `Switch to light mode`. */
  toLight: string
}

const defaultLabels: ThemeSwitcherLabels = {
  toDark: 'Switch to dark mode',
  toSystem: 'Switch to system mode',
  toLight: 'Switch to light mode'
}

export function ThemeSwitcher({ labels }: { labels?: Partial<ThemeSwitcherLabels> }) {
  const { theme, setTheme } = useTheme()
  const current = theme ?? 'system'
  const names = { ...defaultLabels, ...labels }
  const byTheme: Record<string, string> = {
    light: names.toDark,
    dark: names.toSystem,
    system: names.toLight
  }
  const Icon = current === 'light' ? Sun : current === 'dark' ? Moon : Monitor

  return (
    <Button
      variant='ghost'
      icon={Icon}
      onClick={() => setTheme(cycle[current] ?? 'light')}
      aria-label={byTheme[current]}
    />
  )
}
