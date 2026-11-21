import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LinkButton } from 'uilibs/base/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from 'uilibs/extra/description-list'
import { Logo } from '#/components/logo'
import { PageTitle } from '#/components/page-title'
import { PreferencesMenu } from '#/components/preferences-menu'
import { getMessages, useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/home.stylex'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_home() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <div {...stylex.props(layout.root)}>
      <header {...stylex.props(layout.header)}>
        <div {...stylex.props(layout.container, layout.headerRow)}>
          <Link to='/' {...stylex.props(layout.brand)}>
            <Logo />
            Rusttp
          </Link>
          <PreferencesMenu />
        </div>
      </header>

      <main {...stylex.props(layout.main, layout.container, styles.main)}>
        <section {...stylex.props(styles.hero)}>
          <PageTitle>{m.home_title()}</PageTitle>
          <p {...stylex.props(styles.lead)}>{m.home_lead()}</p>
          <LinkButton render={<Link to='/login' />} size='lg'>
            {m.home_sign_in()}
          </LinkButton>
        </section>

        <section>
          <h2 {...stylex.props(styles.sectionTitle)}>{m.home_inside()}</h2>
          <DescriptionList>
            <DescriptionTerm>{m.home_server()}</DescriptionTerm>
            <DescriptionDetails>{m.home_server_details()}</DescriptionDetails>
            <DescriptionTerm>{m.home_web()}</DescriptionTerm>
            <DescriptionDetails>{m.home_web_details()}</DescriptionDetails>
            <DescriptionTerm>{m.home_interface()}</DescriptionTerm>
            <DescriptionDetails>{m.home_interface_details()}</DescriptionDetails>
            <DescriptionTerm>{m.home_tooling()}</DescriptionTerm>
            <DescriptionDetails>{m.home_tooling_details()}</DescriptionDetails>
          </DescriptionList>
        </section>
      </main>

      <footer {...stylex.props(layout.footer)}>
        <div {...stylex.props(layout.container)}>v{import.meta.env.PUBLIC_APP_VERSION}</div>
      </footer>
    </div>
  )
}
