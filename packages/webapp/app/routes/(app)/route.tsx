import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { styles as layout } from '#/styles/element/layout.stylex'
import { DashboardHeader } from './-header'

// The customer dashboard: a slim top navigation above the page.
export const Route = createFileRoute('/(app)')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div {...stylex.props(layout.root)}>
      <DashboardHeader />
      <Outlet />
    </div>
  )
}
