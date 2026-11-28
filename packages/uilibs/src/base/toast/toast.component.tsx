/**
 * Toast component built on BaseUI React with configurable positioning.
 * Supports both stacked (notifications) and anchored (tooltips) toasts.
 *
 * @see: https://base-ui.com/react/components/toast
 *
 * BaseUI Anatomy:
 * <Toast.Provider>
 *   <Toast.Portal>
 *     <Toast.Viewport>
 *       // Stacked toasts
 *       <Toast.Root>
 *         <Toast.Content>
 *           <Toast.Title />
 *           <Toast.Description />
 *           <Toast.Action />
 *           <Toast.Close />
 *         </Toast.Content>
 *       </Toast.Root>
 *       // Anchored toasts
 *       <Toast.Positioner>
 *         <Toast.Root>
 *           <Toast.Arrow />
 *           <Toast.Content>
 *             <Toast.Title />
 *             <Toast.Description />
 *             <Toast.Action />
 *             <Toast.Close />
 *           </Toast.Content>
 *         </Toast.Root>
 *       </Toast.Positioner>
 *     </Toast.Viewport>
 *   </Toast.Portal>
 * </Toast.Provider>
 */

import { Toast as BaseToast } from '@base-ui/react/toast'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import { type, descriptionText } from '../../styles/type.stylex'
import type { ColorRole, Glyph, StyleProp } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import { usePortalContainer } from '../../theme/theme-scope.context'
import { type CloseLabels, CloseButton } from '../dialog/close-button'
import { toastStyles as s, toastColors as colors, toastPositions } from './toast.stylex'

/** The manager behind the imperative `toast` API — pass to `useToast` consumers if needed. */
export const toastManager = BaseToast.createToastManager()

export type ToastColor = ColorRole

/** The screen corner or edge centre the stack sits in. */
export type ToasterPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

type ToastAddOptions = Omit<Parameters<typeof toastManager.add>[0], 'title' | 'data'> & {
  /** The color role of the toast's accent; `neutral` unless the type implies one. */
  color?: ToastColor
}

// The mark each status carries beside the title; a neutral toast has none.
const colorGlyphs: Partial<Record<ToastColor, Glyph>> = {
  primary: Info,
  positive: CircleCheck,
  warning: TriangleAlert,
  critical: CircleAlert
}

const colorNames: readonly string[] = ['neutral', 'primary', 'positive', 'warning', 'critical']

// `success` and `error` toasts (the helpers, and `toast.promise` outcomes) have a color of their own.
const typeColors: Record<string, ToastColor> = { success: 'positive', error: 'critical' }

function colorOf(data: unknown, kind: string | undefined): ToastColor {
  if (typeof data === 'object' && data !== null && 'color' in data) {
    const { color } = data
    const named = colorNames.find((name): name is ToastColor => name === color)
    if (named) return named
  }
  return (kind && typeColors[kind]) || 'neutral'
}

function addToast(title: React.ReactNode, options?: ToastAddOptions) {
  const { color, ...rest } = options ?? {}
  return toastManager.add({ title, ...rest, data: color ? { color } : undefined })
}

/**
 * Imperative API, callable anywhere — event handlers, stores, outside React:
 * `toast('Saved')`, `toast.error('Failed', { description: '…' })`,
 * `toast('Heads up', { color: 'warning' })`,
 * `toast.promise(save(), { loading: '…', success: '…', error: '…' })`.
 * Requires `ToastProvider` + `Toaster` to be mounted (e.g. in the root layout).
 */
export const toast = Object.assign(addToast, {
  success: (title: React.ReactNode, options?: ToastAddOptions) =>
    addToast(title, { ...options, type: 'success' }),
  error: (title: React.ReactNode, options?: ToastAddOptions) =>
    addToast(title, { ...options, type: 'error' }),
  promise: toastManager.promise.bind(toastManager),
  update: toastManager.update.bind(toastManager),
  close: toastManager.close.bind(toastManager)
})

/** Hook form of the same API: `const t = useToast(); t.add({ title })`. */
export function useToast() {
  return BaseToast.useToastManager()
}

// Wired to the shared manager so the imperative `toast` reaches it; pass your
// own `toastManager` to opt out.
export function ToastProvider(props: React.ComponentProps<typeof BaseToast.Provider>) {
  return <BaseToast.Provider toastManager={toastManager} {...props} />
}

export interface ToasterLabels extends CloseLabels {
  /** Name of a toast that has no title (a `toast.promise` outcome set as a description). Defaults to `Notification`. */
  notification: string
}

function ToastList({
  swipeDirection,
  top,
  labels
}: {
  swipeDirection: React.ComponentProps<typeof BaseToast.Root>['swipeDirection']
  top: boolean
  labels?: Partial<ToasterLabels>
}) {
  const { toasts } = BaseToast.useToastManager()
  return toasts.map((t) => {
    const color = colorOf(t.data, t.type)
    const StatusGlyph = colorGlyphs[color]
    return (
      <BaseToast.Root
        key={t.id}
        toast={t}
        swipeDirection={swipeDirection}
        // A toast is a dialog and needs a name; the title gives it one when there is a title.
        aria-label={t.title ? undefined : (labels?.notification ?? 'Notification')}
        {...stylex.props(s.root, top ? s.rootTop : s.rootBottom, colors[color])}
      >
        <div {...stylex.props(s.content)}>
          {StatusGlyph ? (
            // The title carries the meaning, so the glyph is decoration.
            <span {...stylex.props(s.glyph)}>
              <StatusGlyph size={glyphSize.large} aria-hidden />
            </span>
          ) : null}
          <div {...stylex.props(s.text)}>
            <BaseToast.Title {...stylex.props(s.title)} />
            <BaseToast.Description {...stylex.props(type.body2, descriptionText.root)} />
          </div>
          <BaseToast.Action {...stylex.props(focusRing.root, s.action)} />
          <BaseToast.Close render={<CloseButton labels={labels} style={s.close} />} />
        </div>
      </BaseToast.Root>
    )
  })
}

/** `style` is the viewport's StyleX style, merged last. */
export interface ToasterProps extends StyleProp {
  /** Where the stack sits on the screen. Default `bottom-right`. */
  position?: ToasterPosition
  /** Direction(s) a toast can be swiped to dismiss. Default: toward the stack's own edges, so `['down', 'right']` for `bottom-right`. */
  swipeDirection?: React.ComponentProps<typeof BaseToast.Root>['swipeDirection']
  /** Accessible names of the close button and of a toast without a title; English by default. */
  labels?: Partial<ToasterLabels>
}

/**
 * Mount once (inside ToastProvider) — renders the toast stack. Toasts pile up
 * behind the newest one; hovering or focusing the stack expands it. Swipe
 * toward the stack's edge (touch or mouse) to dismiss.
 */
export function Toaster({
  position = 'bottom-right',
  swipeDirection,
  labels,
  style
}: ToasterProps) {
  const top = position.startsWith('top')
  const vertical = top ? 'up' : 'down'
  const side = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : null
  return (
    <BaseToast.Portal container={usePortalContainer()}>
      <BaseToast.Viewport {...stylex.props(s.viewport, toastPositions[position], style)}>
        <ToastList
          swipeDirection={swipeDirection ?? (side ? [vertical, side] : vertical)}
          top={top}
          labels={labels}
        />
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}
