import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, useMatches } from '@tanstack/react-router'
import { UIProvider } from 'uilibs/base/provider'
import { ThemeProvider } from 'uilibs/theme'
import { GlobalError, GlobalNotFound } from '#/routes/-boundaries'
import DevTools from '#/routes/-devtools'

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
      <UIProvider>
        <ThemeProvider attribute='data-theme' defaultTheme='system'>
          <title>{pageTitle ? `${pageTitle} - Rusttp` : 'Rusttp'}</title>
          <Outlet />
          <DevTools queryClient={queryClient} />
        </ThemeProvider>
      </UIProvider>
    </QueryClientProvider>
  )
}
