import { useMediaQuery } from 'uilibs/hooks/use-media-query'

/**
 * True below the compact breakpoint, where the admin layout swaps its sidebar for the top bar. The
 * query restates `breakpoints.compact` in `styles/constants.stylex.ts` (767px): a hook runs at
 * runtime and cannot import a StyleX constant, so a change to one is a change to the other.
 */
export function useCompact(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
