import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

const healthQuery = queryOptions({
  queryKey: ['healthz'],
  queryFn: async () => {
    const response = await fetch('/healthz')
    if (!response.ok) throw new Error(`Health check failed: HTTP ${response.status}`)
    return response.text()
  },
  staleTime: 0
})

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  component: RouteComponent,
  staticData: { pageTitle: 'Home' }
})

function RouteComponent() {
  const { data: health } = useSuspenseQuery(healthQuery)

  return (
    <main className='page'>
      <h1>Rusttp</h1>
      <p>
        Server health: <code>{health}</code>
      </p>
      <p>
        Edit <code>app/routes/index.tsx</code> to get started.
      </p>
      <footer>v{import.meta.env.PUBLIC_APP_VERSION}</footer>
    </main>
  )
}
