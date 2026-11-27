import type { Preview } from '@storybook/tanstack-react'
import { FORCE_REMOUNT } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { configure } from 'storybook/test'
import { GlobalDecorator } from './decorator'
import { ThemedDocsContainer } from './docs-container'
import { STORYBOOK_THEME_GLOBAL } from './theme-global'
import '../src/assets/globals.css'

// `console.error` is where React reports a duplicate key, an invalid style property, or a DOM
// nesting error: a story that logs one fails, so these never reach a consumer unseen. A story with
// a known defect opts out with `parameters: { consoleErrors: 'off' }` and names the finding.
const consoleErrors: string[] = []
const nativeConsoleError = console.error

const gateMode = (value: unknown) => (value === 'todo' || value === 'off' ? value : 'error')

const INTERACTIONS_GLOBAL = 'interactions'

// A story's `play` runs on every load in the UI, so the canvas flickers through its clicks and
// typing. Storybook 10.6.8 has no option for this (autoplay is off only under `?embed=true`), but the
// project `beforeEach` runs just before the render reads `renderOptions.autoplay`, and that render is
// `currentRender`. The test run (Vitest browser mode) always plays; the UI plays only when the
// Interactions toolbar global is `on`. Rerun in the Interactions panel (and its step buttons) emits
// FORCE_REMOUNT, which reuses the same render, so the story it names plays once whatever the global.
// Both globals belong to Storybook and Vitest; they are read by name, untyped, and checked.
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const rerunRequested = new Set<string>()
let listening = false

function setAutoplay(storyId: string, play: boolean) {
  if (Reflect.get(globalThis, '__vitest_browser__')) return
  if (!listening && addons.hasChannel()) {
    listening = true
    addons.getChannel().on(FORCE_REMOUNT, ({ storyId: id }: { storyId: string }) => {
      rerunRequested.add(id)
    })
  }
  if (rerunRequested.delete(storyId)) play = true
  const preview: unknown = Reflect.get(globalThis, '__STORYBOOK_PREVIEW__')
  const render = isObject(preview) ? preview.currentRender : undefined
  if (!isObject(render) || render.type !== 'story' || render.id !== storyId) return
  if (isObject(render.renderOptions)) render.renderOptions.autoplay = play
}

// A play reads computed styles and boxes the moment it starts, so under test the page must be
// settled first. Two things arrive late in Vitest browser mode:
// - the StyleX stylesheet: the dev runtime fetches it into `<style id=__stylex_virtual__>` after the
//   server's CSS version changes (a 150 ms poll), so a story that rendered right after its modules
//   compiled could be measured unstyled (an input group 26 px high instead of 32);
// - the web fonts, whose `swap` re-measures text mid-play.
// A test file's modules, and so its CSS, are all compiled when the file loads: the first story
// compares the page's sheet with the server's (a fetch, ~10 ms) and the next ones only check that
// the page's sheet is still the text it matched, which costs no request. A sheet that changed (the
// runtime applied a newer version) is compared with the server again.
const STYLEX_STYLE_ID = '__stylex_virtual__'
const STYLEX_CSS_PATH = '/virtual:stylex.css'
const SETTLE_TIMEOUT_MS = 10_000

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

let matchedLength = -1

async function stylesheetCaughtUp() {
  const style = document.getElementById(STYLEX_STYLE_ID)
  if (!style) return
  if (style.textContent?.length === matchedLength) return
  const deadline = Date.now() + SETTLE_TIMEOUT_MS
  for (;;) {
    const served = await (await fetch(STYLEX_CSS_PATH, { cache: 'no-store' })).text()
    const sheet = document.getElementById(STYLEX_STYLE_ID)
    if (sheet?.textContent === served) {
      matchedLength = served.length
      return
    }
    if (Date.now() > deadline)
      throw new Error('The StyleX stylesheet never caught up with the dev server.')
    await sleep(25)
  }
}

// A font that cannot load (offline) falls back to the system stack, which does not shift.
async function fontsLoaded() {
  const loading = Promise.allSettled(Array.from(document.fonts, (face) => face.load()))
  await Promise.race([loading, sleep(3000)])
}

async function settlePage() {
  if (!Reflect.get(globalThis, '__vitest_browser__')) return
  await stylesheetCaughtUp()
  await fontsLoaded()
}

// A story must fit a phone: the test run renders every story at 390 px (the `viewport` global
// below; the Vitest addon sets the window from `globals.viewport.value`, 1200 px when none), and a
// page wider than that means a layout that pushes the page sideways. A story whose content scrolls
// inside its own box on purpose (a data grid, a board, a row of every size) opts out with
// `parameters: { overflow: 'allowed' }` and says why. Only the test run measures: in the UI the
// viewport is whatever the window is.
//
// The global must be the object `{ value, isRotated }`: the addon reads `.value`, so a bare string
// leaves the window at 1200 px and the gate would pass without checking anything. The guard below
// fails the story when the window is not the width its viewport names.
function assertViewportApplied(
  parameters: Record<string, unknown>,
  globals: Record<string, unknown>
) {
  const viewport = isObject(parameters.viewport) ? parameters.viewport : {}
  const options = isObject(viewport.options) ? viewport.options : {}
  const key = isObject(globals.viewport) ? globals.viewport.value : undefined
  const entry = typeof key === 'string' ? options[key] : undefined
  const styles = isObject(entry) && isObject(entry.styles) ? entry.styles : {}
  const expected = typeof styles.width === 'string' ? Number.parseInt(styles.width, 10) : undefined
  if (expected === undefined) {
    throw new Error(
      "The story has no viewport global the gate can read. Set `globals: { viewport: { value: 'phone' | 'desktop', isRotated: false } }` (an object, never a string)."
    )
  }
  if (window.innerWidth !== expected) {
    throw new Error(
      `The viewport global names ${expected}px but the window is ${window.innerWidth}px, so the overflow gate would not measure what it claims.`
    )
  }
}

function assertNoHorizontalOverflow(
  parameters: Record<string, unknown>,
  globals: Record<string, unknown>
) {
  if (!Reflect.get(globalThis, '__vitest_browser__')) return
  assertViewportApplied(parameters, globals)
  if (parameters.overflow === 'allowed') return
  const { scrollWidth, clientWidth } = document.documentElement
  if (scrollWidth <= clientWidth) return
  const wide = Array.from(document.body.querySelectorAll('*'))
    .map((element) => ({ element, right: element.getBoundingClientRect().right }))
    .filter(({ right }) => right > clientWidth + 1)
    .slice(0, 3)
    .map(({ element, right }) => {
      const slot = element.getAttribute('data-slot') ?? element.getAttribute('role')
      return `<${element.localName}${slot ? ` ${slot}` : ''}> ends at ${Math.round(right)}px`
    })
  throw new Error(
    `The story is ${scrollWidth - clientWidth}px wider than the ${clientWidth}px viewport. Widest: ${wide.join(', ')}. ` +
      "Fix the layout, or set `parameters: { overflow: 'allowed' }` if the content scrolls on purpose."
  )
}

const preview: Preview = {
  parameters: {
    // The fluid canvas: a story's content is padded and never given a minimum width, so a 390 px
    // viewport shows the layout a phone gets. A file opts out only for `fullscreen`.
    layout: 'padded',
    // The viewport sizes: the toolbar lists them and the test run resolves the `viewport` global
    // against them (`initialGlobals` below). A story that needs room sets
    // `globals: { viewport: { value: 'desktop', isRotated: false } }`.
    viewport: {
      options: {
        phone: { name: 'Phone', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '900px' }, type: 'desktop' },
        // A phone turned on its side with the keyboard up: a tall popup must scroll in it.
        short: { name: 'Short', styles: { width: '390px', height: '320px' }, type: 'mobile' }
      }
    },
    options: {
      // Top-level groups, in the order the sidebar shows them; inside a group stories keep file order.
      storySort: {
        order: [
          'Introduction',
          'Components',
          'Styling',
          'Theming',
          'Base Components',
          'Extra Components',
          'Data Grid',
          'Visualizations',
          'Contracts'
        ]
      }
    },
    // Controls show only on a component's `Playground`, which turns them back on with
    // `controls: { disable: false, include: [...] }`; every other story shows none.
    controls: { disable: true },
    docs: { container: ThemedDocsContainer },
    a11y: {
      // 'error' - fail on a11y violations (the default)
      // 'todo' - show a11y violations in the test UI only
      // 'off' - skip a11y checks entirely
      // STORYBOOK_A11Y_GATE=todo|off relaxes the gate for a local run; CI keeps `error`.
      test: gateMode(import.meta.env.STORYBOOK_A11Y_GATE),
      // The allowlist. Base UI puts focusable `aria-hidden` guard spans around a popup so focus
      // can leave it; they are meant to be focus targets, and axe flags them as `aria-hidden-focus`.
      // They are Base UI's, not the library's: nothing else is excluded.
      context: { exclude: [['[data-base-ui-focus-guard]']] }
    }
  },
  globalTypes: {
    [STORYBOOK_THEME_GLOBAL]: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'system', title: 'System', icon: 'contrast' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' }
        ],
        dynamicTitle: true
      }
    },
    [INTERACTIONS_GLOBAL]: {
      description: 'Run each story play function when it loads',
      toolbar: {
        title: 'Interactions',
        icon: 'play',
        items: [
          { value: 'off', title: 'Interactions off', icon: 'stop' },
          { value: 'on', title: 'Interactions on', icon: 'play' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    [STORYBOOK_THEME_GLOBAL]: 'system',
    [INTERACTIONS_GLOBAL]: 'off',
    // Only the test run sizes the window to a phone; the Storybook UI keeps its fluid canvas.
    viewport: Reflect.get(globalThis, '__vitest_browser__')
      ? { value: 'phone', isRotated: false }
      : undefined
  },
  // Every `waitFor` and `findBy*` waits up to 10 s (testing-library's default is 1 s), so a loaded
  // runner or a slower engine does not turn a settling popup into a flake. A wait that needs more
  // says so with its own `timeout`. `pressUntil` and the story projects' `testTimeout` follow it.
  beforeAll: () => {
    configure({ asyncUtilTimeout: 10_000 })
  },
  beforeEach: async ({ id, globals }) => {
    setAutoplay(id, globals[INTERACTIONS_GLOBAL] === 'on')
    consoleErrors.length = 0
    console.error = (...args: unknown[]) => {
      consoleErrors.push(args.map(String).join(' ').slice(0, 300))
      nativeConsoleError(...args)
    }
    await settlePage()
  },
  afterEach: ({ parameters, globals }) => {
    console.error = nativeConsoleError
    assertNoHorizontalOverflow(parameters, globals)
    if (parameters.consoleErrors !== 'off' && consoleErrors.length > 0) {
      throw new Error(
        `The story logged ${consoleErrors.length} console error(s):\n${consoleErrors.join('\n')}`
      )
    }
  },
  decorators: [
    (Story, context) => (
      <GlobalDecorator context={context}>
        <Story />
      </GlobalDecorator>
    )
  ]
}

export default preview
