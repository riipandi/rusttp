import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: 0 },
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5, retry: 1 }
  }
})
