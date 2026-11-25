import { Monitor, Moon, Sun } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Button } from '../base/button'
import type { Glyph } from '../styles/types'
import { useTheme } from './theme'
import { themeSwitcherStyles as s } from './theme-switcher.stylex'

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

const icons = { light: Sun, dark: Moon, system: Monitor } as const
const iconNames = ['light', 'dark', 'system'] as const

/**
 * The three theme icons, stacked: the current one turns in and fades up while the last one turns
 * out and fades away. It reads the theme itself, so `Button` gets one stable glyph and the icons
 * keep their elements across a switch, which is what lets the transition run.
 */
const ThemeGlyph: Glyph = ({ size = 16, ...props }) => {
  const { theme } = useTheme()
  const current = theme === 'light' || theme === 'dark' ? theme : 'system'
  return (
    <span aria-hidden='true' {...stylex.props(s.glyph(size))}>
      {iconNames.map((name) => {
        const Icon = icons[name]
        return (
          <span
            key={name}
            data-icon={name}
            data-current={name === current ? '' : undefined}
            {...stylex.props(s.icon, name === current ? s.shown : s.hidden)}
          >
            <Icon size={size} {...props} />
          </span>
        )
      })}
    </span>
  )
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

  return (
    <Button
      variant='ghost'
      icon={ThemeGlyph}
      onClick={() => setTheme(cycle[current] ?? 'light')}
      aria-label={byTheme[current]}
    />
  )
}
