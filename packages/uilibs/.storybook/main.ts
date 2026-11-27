import type { StorybookConfig } from '@storybook/tanstack-react'
import react from '@vitejs/plugin-react'
import { stylexPlugin } from 'plugins/stylex'
import remarkGfm from 'remark-gfm'
import { mergeConfig } from 'vite'

// `STORYBOOK_COMPILER=1` runs the dev server, the build, and the story projects of the test run through
// the React Compiler, as the webapp ships the library (`react({ compiler: true })`). It is off by
// default: the plain run is the fast gate, and the nightly compiler leg (`uilibs.yml`) reports every
// component the compiler bails out of (`reportDiagnostics`), which the webapp build prints nowhere.
const compiler = process.env.STORYBOOK_COMPILER === '1'

export default {
  stories: ['./stories/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(jsx|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]
          }
        }
      }
    },
    '@storybook/addon-vitest',
    '@storybook/addon-mcp'
  ],
  framework: '@storybook/tanstack-react',
  core: {
    allowedHosts: ['localhost', '127.0.0.1'],
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
    enableCrashReports: false
  },
  // The component manifests feed the MCP server (`storybook dev`), not the static site: left in a
  // build they add 3.5 MB of JSON with the builder's absolute file paths.
  features: { backgrounds: false, componentsManifest: process.env.STORYBOOK_BUILD !== '1' },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      build: {
        chunkSizeWarningLimit: 1024 * 4,
        rolldownOptions: {
          checks: {
            bundlerTimings: false
          }
        }
      },
      plugins: [
        stylexPlugin({}),
        ...(compiler ? react({ compiler: { reportDiagnostics: true } }) : [])
      ]
    })
  }
} satisfies StorybookConfig
