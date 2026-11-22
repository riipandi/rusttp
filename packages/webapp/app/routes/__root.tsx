import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, useMatches } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { UIProvider } from 'uilibs/base/provider'
import { TooltipProvider } from 'uilibs/base/tooltip'
import { ThemeProvider } from 'uilibs/theme'
import { localeStore } from '#/libraries/locale.store'
import { getTextDirection } from '#/paraglide/runtime'
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
  const locale = useSelector(localeStore)
  const pageTitle = useMatches()
    .findLast((match) => match.staticData?.pageTitle)
    ?.staticData?.pageTitle?.()

  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider direction={getTextDirection(locale)}>
        <ThemeProvider attribute='data-theme' defaultTheme='system'>
          <title>{pageTitle ? `${pageTitle} - Rusttp` : 'Rusttp'}</title>
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>
          <DevTools queryClient={queryClient} />
        </ThemeProvider>
      </UIProvider>
    </QueryClientProvider>
  )
}
