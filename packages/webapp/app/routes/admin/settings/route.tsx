import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/settings')({
  component: RouteComponent,
  staticData: { pageTitle: 'Settings' }
})

function RouteComponent() {
  return <Outlet />
}
