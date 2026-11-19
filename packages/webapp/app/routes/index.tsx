import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LinkButton } from 'uilibs/base/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from 'uilibs/extra/description-list'
import { ThemeSwitcher } from 'uilibs/theme'
import { Logo } from '#/components/logo'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/home.stylex'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  staticData: { pageTitle: 'Home' }
})

function RouteComponent() {
  return (
    <div {...stylex.props(layout.root)}>
      <header {...stylex.props(layout.header)}>
        <div {...stylex.props(layout.container, layout.headerRow)}>
          <Link to='/' {...stylex.props(layout.brand)}>
            <Logo />
            Rusttp
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      <main {...stylex.props(layout.main, layout.container, styles.main)}>
        <section {...stylex.props(styles.hero)}>
          <h1 {...stylex.props(styles.title)}>
            Rusttp serves its own React app from one Rust binary.
          </h1>
          <p {...stylex.props(styles.lead)}>
            An axum server with Connect RPC and REST, a Vite and TanStack Router app, and a StyleX
            component library, built and tested together.
          </p>
          <LinkButton render={<Link to='/login' />} size='lg'>
            Sign in
          </LinkButton>
        </section>

        <section>
          <h2 {...stylex.props(styles.sectionTitle)}>What is inside</h2>
          <DescriptionList>
            <DescriptionTerm>Server</DescriptionTerm>
            <DescriptionDetails>
              axum, with Connect RPC on /rpc and REST on /api.
            </DescriptionDetails>
            <DescriptionTerm>Web</DescriptionTerm>
            <DescriptionDetails>
              React, Vite, TanStack Router and Query, embedded into the binary at build time.
            </DescriptionDetails>
            <DescriptionTerm>Interface</DescriptionTerm>
            <DescriptionDetails>
              Base UI primitives styled with StyleX, in light and dark.
            </DescriptionDetails>
            <DescriptionTerm>Tooling</DescriptionTerm>
            <DescriptionDetails>
              jsx-email templates, Playwright end-to-end tests, and Hurl API specs.
            </DescriptionDetails>
          </DescriptionList>
        </section>
      </main>

      <footer {...stylex.props(layout.footer)}>
        <div {...stylex.props(layout.container)}>v{import.meta.env.PUBLIC_APP_VERSION}</div>
      </footer>
    </div>
  )
}
