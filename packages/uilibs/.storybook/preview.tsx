import type { Preview } from '@storybook/tanstack-react'
import { GlobalDecorator, STORYBOOK_THEME_GLOBAL } from './decorator'
import { ThemedDocsContainer } from './docs-container'
import '../src/assets/globals.css'

const gateMode = (value: unknown) => (value === 'todo' || value === 'off' ? value : 'error')

const preview: Preview = {
  parameters: {
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
  decorators: [
    (Story, context) => (
      <GlobalDecorator context={context}>
        <Story />
      </GlobalDecorator>
    )
  ]
}

export default preview
