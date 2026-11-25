import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { TooltipProvider } from 'uilibs/base/tooltip'
import { Stack } from 'uilibs/extra/stack'
import { AnnouncementBar } from '#/components/announcement-bar'
import { SkipLink } from '#/components/skip-link'
import { adminProfile } from '#/fixtures/profile'
import { useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { DashboardHeader } from './-header'

// The customer dashboard: an announcement strip and a slim top navigation above the page.
export const Route = createFileRoute('/(app)')({
  component: RouteComponent
})

// The role comes from a fixture until there is a session. The strip is also where
// a promotion or an announcement will go: it shows the first notice that applies.
function RouteComponent() {
  const m = useMessages()
  const isAdministrator = adminProfile.role === 'Administrator'

  return (
    // The notification bell in the header has a tooltip; see `routes/admin/route.tsx` for why the
    // provider is not at the root.
    <TooltipProvider>
      <Stack style={layout.root}>
        <SkipLink />
        {isAdministrator && (
          <AnnouncementBar
            label={m.app_banner_admin_label()}
            action={{ label: m.app_banner_admin_action(), render: <Link to='/admin' /> }}
          >
            {m.app_banner_admin_notice()}
          </AnnouncementBar>
        )}
        <DashboardHeader />
        <Outlet />
      </Stack>
    </TooltipProvider>
  )
}
