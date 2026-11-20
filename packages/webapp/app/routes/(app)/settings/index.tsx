import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/settings/')({
  beforeLoad: () => {
    return redirect({ to: '/settings/account', replace: true })
  }
})
