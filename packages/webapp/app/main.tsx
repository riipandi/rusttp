import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { queryClient } from '#/libraries/query-client'
import { routeTree } from './routes.gen'
import './assets/globals.css'

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // Loaders read through the query cache, so the router never holds stale data of its own.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface StaticDataRouteOption {
    pageTitle?: string
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element missing. Verify the element exists and the ID is correct.')
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
