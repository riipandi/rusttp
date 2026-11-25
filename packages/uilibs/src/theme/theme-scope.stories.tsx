import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../base/button'
import { Popover, PopoverContent, PopoverTrigger } from '../base/popover'
import { cellOf } from '../contracts/control-sizes'
import { Axis } from '../contracts/story-axes'
import { radius, unit } from '../styles/tokens.stylex'
import { type } from '../styles/type.stylex'
import { ThemeScope, type ThemeScopeColorMode } from './theme-scope'

const meta = {
  title: 'Extra Components/ThemeScope',
  component: ThemeScope,
  tags: [] // ['autodocs']
} satisfies Meta<typeof ThemeScope>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  panel: { borderRadius: radius.large, padding: unit.x4 },
  title: { margin: 0, marginBottom: unit.x3 },
  row: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: unit.x2 }
})

export default meta

const modes = ['dark', 'light', 'inverted'] as const

function Panel({ title }: { title: string }) {
  return (
    <>
      <p {...stylex.props(type.body1, styles.title)}>{title}</p>
      <div {...stylex.props(styles.row)}>
        <Button>Accio</Button>
        <Button variant='outline'>Lumos</Button>
      </div>
    </>
  )
}

/** The mode a scope draws: the page's theme, as the provider applied it, or the opposite. */
function expectedMode(mode: ThemeScopeColorMode) {
  const page = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  return mode === 'inverted' ? (page === 'dark' ? 'light' : 'dark') : mode
}

/** The 0-255 brightness of a CSS color, whatever syntax the engine computes it to (`oklch`, `rgb`). */
function brightness(color: string) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('No 2d canvas to read a color from')
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data
  return (r + g + b) / 3
}

function scopeOf(root: HTMLElement) {
  const scope = root.querySelector('[data-color-mode]')
  if (!(scope instanceof HTMLElement)) throw new Error('No ThemeScope rendered')
  return scope
}

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['colorMode'] } },
  argTypes: { colorMode: { control: 'radio', options: modes } },
  args: { colorMode: 'dark' },
  render: (args) => (
    <ThemeScope {...args} style={styles.panel}>
      <Panel title='Marauder’s Map' />
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const scope = scopeOf(canvasElement)
    await expect(scope).toHaveAttribute('data-color-mode', 'dark')
    await expect(getComputedStyle(scope).colorScheme).toBe('dark')
  }
}

/** A scope draws its own mode whatever the page is; `inverted` is the opposite of the page. */
export const Modes: Story = {
  args: { colorMode: 'dark' },
  render: () => (
    <Axis axis='mode' rows={modes}>
      {(colorMode) => (
        <ThemeScope colorMode={colorMode} style={styles.panel}>
          <Panel title={`Hogwarts, ${colorMode}`} />
        </ThemeScope>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme'))
    const look = new Map<string, { background: number; text: number }>()
    for (const mode of modes) {
      const scope = scopeOf(cellOf(canvasElement, 'mode', mode))
      const style = getComputedStyle(scope)
      const resolved = expectedMode(mode)
      await expect(scope).toHaveAttribute('data-color-mode', resolved)
      await expect(style.colorScheme).toBe(resolved)
      look.set(mode, {
        background: brightness(style.backgroundColor),
        text: brightness(style.color)
      })
    }
    // Dark is a dark surface with light text, light the reverse, and `inverted` is one of the two.
    const dark = look.get('dark')!
    const light = look.get('light')!
    await expect(dark.background).toBeLessThan(80)
    await expect(dark.text).toBeGreaterThan(180)
    await expect(light.background).toBeGreaterThan(180)
    await expect(light.text).toBeLessThan(80)
    const inverted = look.get('inverted')!
    const opposite = expectedMode('inverted') === 'dark' ? dark : light
    await expect(inverted).toEqual(opposite)
  }
}

/** `inverted` flips the enclosing scope, not the page. */
export const Nested: Story = {
  args: { colorMode: 'dark' },
  render: () => (
    <ThemeScope colorMode='dark' style={styles.panel}>
      <Panel title='Outer, dark' />
      <ThemeScope colorMode='inverted' style={styles.panel} data-testid='inner'>
        <Panel title='Inner, inverted' />
      </ThemeScope>
    </ThemeScope>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('inner')).toHaveAttribute('data-color-mode', 'light')
  }
}

/**
 * A popup portals out of its scope. It opens into the scope's own themed element at the end of
 * the body, so a dark scope opens dark popovers on a light page and the reverse.
 */
export const Popups: Story = {
  args: { colorMode: 'dark' },
  render: () => (
    <Axis axis='mode' rows={['dark', 'light'] as const}>
      {(colorMode) => (
        <ThemeScope colorMode={colorMode} style={styles.panel}>
          <Popover>
            <PopoverTrigger
              render={<Button variant='outline' />}
            >{`Open ${colorMode}`}</PopoverTrigger>
            <PopoverContent aria-label={`Popover in ${colorMode}`}>
              Wingardium Leviosa
            </PopoverContent>
          </Popover>
        </ThemeScope>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body)
    const surfaces: Record<string, number> = {}
    for (const mode of ['dark', 'light'] as const) {
      const scope = cellOf(canvasElement, 'mode', mode)
      await userEvent.click(within(scope).getByRole('button', { name: `Open ${mode}` }))
      const popup = await body.findByRole('dialog', { name: `Popover in ${mode}` })
      // The popup is outside the scope's DOM but inside its themed portal element.
      await expect(scope.contains(popup)).toBe(false)
      await expect(popup.closest('[data-theme-scope-portal]')).toHaveAttribute(
        'data-color-mode',
        mode
      )
      surfaces[mode] = brightness(getComputedStyle(popup).backgroundColor)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    }
    await expect(surfaces.dark).toBeLessThan(80)
    await expect(surfaces.light).toBeGreaterThan(180)
  }
}

// The a11y gate runs after `play`, when Popups' popovers are closed again: this story keeps one
// open in each mode so the gate checks the contrast of both.
export const Open: Story = {
  args: { colorMode: 'dark' },
  render: () => (
    <Axis axis='mode' rows={['dark', 'light'] as const}>
      {(colorMode) => (
        <ThemeScope colorMode={colorMode} style={styles.panel}>
          <Popover defaultOpen>
            <PopoverTrigger
              render={<Button variant='outline' />}
            >{`Opened ${colorMode}`}</PopoverTrigger>
            <PopoverContent side='right' aria-label={`Opened popover in ${colorMode}`}>
              Lumos Maxima
            </PopoverContent>
          </Popover>
        </ThemeScope>
      )}
    </Axis>
  ),
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(2))
  }
}
