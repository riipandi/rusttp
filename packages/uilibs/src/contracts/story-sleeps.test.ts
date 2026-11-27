import { describe, expect, it } from 'vitest'

// A story waits for a state (`waitFor`, `findBy*`, the helpers in `overlay.ts`); it never sleeps. A
// fixed sleep is shorter than the settle on a slow runner and longer than needed on a fast one.
// The only `setTimeout` a story may hold is the latency of a simulated backend, listed here with
// the number of calls the file makes, so a new sleep in one of these files fails too.
const simulatedLatency: Record<string, { calls: number; reason: string }> = {
  'base/alert-dialog/alert-dialog.stories.tsx': { calls: 1, reason: 'the pending delete request' },
  'base/toast/toast.stories.tsx': { calls: 1, reason: 'the promise toast request' },
  'data-grid/stories/data-grid-infinite.stories.tsx': {
    calls: 2,
    reason: 'the page fetches of the local and the remote infinite grids'
  },
  'data-grid/stories/data-grid-states.stories.tsx': {
    calls: 1,
    reason: 'the server page of the loading and error states'
  },
  'extra/kanban/kanban.stories.tsx': { calls: 1, reason: 'the fake persistence of a move' },
  'extra/sortable/sortable.stories.tsx': { calls: 1, reason: '`persistOrder`, the optimistic save' }
}

const sources = import.meta.glob<string>('../**/*.stories.tsx', {
  eager: true,
  import: 'default',
  query: '?raw'
})

const sleeps = (text: string) => text.match(/\bsetTimeout\(/g)?.length ?? 0

describe('stories', () => {
  it('wait for a state instead of sleeping', () => {
    const found = Object.entries(sources)
      .map(([path, text]) => [path.slice(3), sleeps(text)] as const)
      .filter(([, calls]) => calls > 0)
    // A glob that matched nothing would pass vacuously.
    expect(Object.keys(sources).length).toBeGreaterThan(100)
    expect(Object.fromEntries(found)).toEqual(
      Object.fromEntries(Object.entries(simulatedLatency).map(([file, { calls }]) => [file, calls]))
    )
  })
})
