import { clean } from '@jsx-email/plugin-clean'
import { urlPlugin } from '@jsx-email/plugin-url'
import { defineConfig } from 'jsx-email/config'

// `build.ts` sets NODE_ENV=production; the preview server runs in development.
const production = process.env.NODE_ENV === 'production'

export const config = defineConfig({
  logLevel: 'warn',
  plugins: [
    // Leaves `{{ … }}` placeholders alone: only valid URLs get the parameters (strict mode).
    urlPlugin({
      append: {
        parameters: { utm_medium: 'email', utm_source: 'rusttp' }
      }
    }),
    // Its default `backend` keeps `{{ }}` and `{% %}` template blocks intact. `Raw` content is still
    // an HTML comment when this runs, so the comments carrying Jinja blocks and head styles stay.
    // The rest go, including the Office XML `Head` adds: jsx-email 3.2 re-emits that block in the
    // body, where its `96` would show as text.
    clean({
      removeCSSComments: true,
      removeHTMLComments: true,
      doNotRemoveHTMLCommentsWhoseOpeningTagContains: ['[if', '[endif', '{%', '<style']
    })
  ],
  render: {
    inlineCss: true,
    minify: production,
    pretty: !production
  }
})
