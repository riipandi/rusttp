import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/settings/')({
  beforeLoad: () => {
    return redirect({ to: '/admin/settings/general', replace: true })
  }
})
