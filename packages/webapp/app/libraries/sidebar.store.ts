import { createStore } from '@tanstack/store'

// The admin sidebar's collapse. Framework-agnostic: React reads it with `useSelector`, and the
// hotkey and the sidebar's own buttons call the same actions.
//
// The collapse persists per browser. Anything but `collapsed` (a missing key, an unknown value, a
// storage that throws) opens expanded; a failed write keeps the state for the session only.
export const sidebarStorageKey = 'admin-sidebar'

function readStored() {
  try {
    return localStorage.getItem(sidebarStorageKey) === 'collapsed'
  } catch {
    return false
  }
}

interface SidebarState {
  /** What the user chose and the browser remembers. */
  stored: boolean
  /** The page brings its own aside (settings), so the sidebar folds to the rail. */
  rail: boolean
  /** A toggle made while `rail` is on: it lasts for that visit and is never written. */
  visit: boolean | null
}

const initial: SidebarState = { stored: false, rail: false, visit: null }

export const sidebarStore = createStore(
  // The SPA renders on the client only, so the stored value is read before the first paint.
  { ...initial, stored: readStored() },
  ({ setState, get }) => {
    function setCollapsed(next: boolean) {
      const state = get()
      if (state.rail) return setState((s) => (s.visit === next ? s : { ...s, visit: next }))
      if (state.stored === next) return
      try {
        localStorage.setItem(sidebarStorageKey, next ? 'collapsed' : 'expanded')
      } catch {}
      setState((s) => ({ ...s, stored: next }))
    }

    return {
      setCollapsed,
      // Flips what the user sees (the derived value), so a toggle on the rail page works too.
      toggle: () => setCollapsed(!sidebarCollapsed.get()),
      /** Entering or leaving a rail page starts a new visit: the old toggle never carries over. */
      setRail: (rail: boolean) =>
        setState((s) => (s.rail === rail ? s : { ...s, rail, visit: null })),
      /** The admin layout unmounted: keep the stored choice, drop what only lasted for a visit. */
      reset: () =>
        setState((s) => (s.rail || s.visit !== null ? { ...s, rail: false, visit: null } : s))
    }
  }
)

/** What the sidebar shows: the rail page folds it unless the visit's own toggle says otherwise. */
export const sidebarCollapsed = createStore(() => {
  const { stored, rail, visit } = sidebarStore.get()
  return rail ? (visit ?? true) : stored
})
