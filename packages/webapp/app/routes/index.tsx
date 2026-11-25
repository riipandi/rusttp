import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from 'uilibs/base/button'
import { Container } from 'uilibs/extra/container'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from 'uilibs/extra/description-list'
import { Stack } from 'uilibs/extra/stack'
import { Logo } from '#/components/logo'
import { PageTitle } from '#/components/page-title'
import { PreferencesMenu } from '#/components/preferences-menu'
import { getMessages, useMessages } from '#/libraries/messages'
import { layoutSize } from '#/styles/constants.stylex'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/home.stylex'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  staticData: { pageTitle: () => getMessages().page_home() }
})

function RouteComponent() {
  const m = useMessages()
  return (
    <Stack style={layout.root}>
      <header {...stylex.props(layout.header)}>
        <Stack
          render={<Container size={layoutSize.page} />}
          direction='row'
          align='center'
          justify='space-between'
          gap={4}
          style={[layout.gutter, layout.headerRow]}
        >
          <Link to='/' {...stylex.props(layout.brand)}>
            <Logo />
            Rusttp
          </Link>
          <PreferencesMenu />
        </Stack>
      </header>

      <Stack
        render={<Container render={<main />} size={layoutSize.page} />}
        justify='center'
        style={[layout.main, layout.gutter, styles.main]}
      >
        <Stack render={<section />} align='start' gap={5}>
          <PageTitle>{m.home_title()}</PageTitle>
          <p {...stylex.props(styles.lead)}>{m.home_lead()}</p>
          <Button render={<Link to='/login' />} size='large'>
            {m.home_sign_in()}
          </Button>
        </Stack>

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
      </Stack>

      <footer {...stylex.props(layout.footer)}>
        <Container size={layoutSize.page} style={layout.gutter}>
          v{import.meta.env.PUBLIC_APP_VERSION}
        </Container>
      </footer>
    </Stack>
  )
}
