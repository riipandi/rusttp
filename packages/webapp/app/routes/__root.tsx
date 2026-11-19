import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, useMatches } from '@tanstack/react-router'
import { GlobalError, GlobalNotFound } from './-boundaries'

export interface GlobalContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<GlobalContext>()({
  component: RootComponent,
  notFoundComponent: GlobalNotFound,
  errorComponent: GlobalError
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  const pageTitle = useMatches().findLast((match) => match.staticData?.pageTitle)?.staticData
    ?.pageTitle

  return (
    <QueryClientProvider client={queryClient}>
      <title>{pageTitle ? `${pageTitle} - Rusttp` : 'Rusttp'}</title>
      <Outlet />
    </QueryClientProvider>
  )
}
