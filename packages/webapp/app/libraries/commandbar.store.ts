import { createStore } from '@tanstack/store'

export type CommandBarPanel = 'commands' | 'shortcuts'

interface CommandBarState {
  open: boolean
  panel: CommandBarPanel
}

const initial: CommandBarState = { open: false, panel: 'commands' }

/**
 * The command bar's open state, shared by the Cmd/Ctrl+K and Cmd/Ctrl+Shift+/ shortcuts, the sidebar's
 * trigger, and the dialog itself, so none of them passes it through the layout.
 */
export const commandBarStore = createStore(initial, ({ setState }) => ({
  /** Opens on a panel; a second call while open switches panels (Back to commands, the cheat sheet). */
  show: (panel: CommandBarPanel = 'commands') =>
    setState((state) => (state.open && state.panel === panel ? state : { open: true, panel })),
  /** The dialog's own open change. The panel stays while the dialog fades out; `show` sets it on the next open. */
  setOpen: (open: boolean) =>
    setState((state) => (state.open === open ? state : { ...state, open })),
  reset: () => setState((state) => (state === initial ? state : initial))
}))
