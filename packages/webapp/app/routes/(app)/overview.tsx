import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/overview')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/(app)/overview"!</div>
}
