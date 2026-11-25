import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Container } from 'uilibs/extra/container'
import { Stack } from 'uilibs/extra/stack'
import { Logo } from '#/components/logo'
import { PreferencesMenu } from '#/components/preferences-menu'
import { useMessages } from '#/libraries/messages'
import { layoutSize } from '#/styles/constants.stylex'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/auth.stylex'

// The layout every auth page shares: a brand panel on wide screens, and the page itself in the form column.
export const Route = createFileRoute('/(auth)')({
  component: RouteComponent
})

function RouteComponent() {
  const m = useMessages()
  return (
    <div {...stylex.props(styles.split)}>
      <aside {...stylex.props(styles.panel)}>
        <Link to='/' {...stylex.props(layout.brand)}>
          <Logo />
          Rusttp
        </Link>
        <div>
          <p {...stylex.props(styles.panelTitle)}>{m.auth_panel_title()}</p>
          <p {...stylex.props(styles.panelText)}>{m.auth_panel_text()}</p>
        </div>
      </aside>

      <Stack render={<main />} style={styles.formSide}>
        <Stack direction='row' align='center'>
          <Link to='/' {...stylex.props(layout.brand, styles.mobileBrand)}>
            <Logo />
            Rusttp
          </Link>
          <div {...stylex.props(styles.theme)}>
            <PreferencesMenu />
          </div>
        </Stack>

        <Stack
          render={<Container size={layoutSize.form} />}
          justify='center'
          gap={8}
          style={styles.formWrap}
        >
          <Outlet />
        </Stack>
      </Stack>
    </div>
  )
}
