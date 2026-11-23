import type { Preview } from '@storybook/tanstack-react'
import { GlobalDecorator, STORYBOOK_THEME_GLOBAL } from './decorator'
import { ThemedDocsContainer } from './docs-container'
import '../src/assets/globals.css'

// `console.error` is where React reports a duplicate key, an invalid style property, or a DOM
// nesting error: a story that logs one fails, so these never reach a consumer unseen. A story with
// a known defect opts out with `parameters: { consoleErrors: 'off' }` and names the finding.
const consoleErrors: string[] = []
const nativeConsoleError = console.error

const gateMode = (value: unknown) => (value === 'todo' || value === 'off' ? value : 'error')

const preview: Preview = {
  parameters: {
    // The fluid canvas: a story's content is padded and never given a minimum width, so a 390 px
    // viewport shows the layout a phone gets. A file opts out only for `fullscreen`.
    layout: 'padded',
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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
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
    }
  },
  initialGlobals: {
    [STORYBOOK_THEME_GLOBAL]: 'system'
  },
  beforeEach: () => {
    consoleErrors.length = 0
    console.error = (...args: unknown[]) => {
      consoleErrors.push(args.map(String).join(' ').slice(0, 300))
      nativeConsoleError(...args)
    }
  },
  afterEach: ({ parameters }) => {
    console.error = nativeConsoleError
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
