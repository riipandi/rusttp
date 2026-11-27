import type { StorybookConfig } from '@storybook/tanstack-react'
import { resolve } from 'node:path'
import { stylexPlugin } from 'plugins/stylex'
import remarkGfm from 'remark-gfm'
import { mergeConfig } from 'vite'

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
    '@github-ui/storybook-addon-performance-panel',
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
      resolve: { tsconfigPaths: true },
      build: {
        chunkSizeWarningLimit: 1024 * 4,
        rolldownOptions: {
          checks: {
            bundlerTimings: false
          }
        }
      },
      plugins: [
        stylexPlugin({
          aliases: { '#/*': resolve(import.meta.dirname, '../src/*') }
        })
      ]
    })
  }
} satisfies StorybookConfig
