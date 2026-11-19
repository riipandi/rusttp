import { Link, type ErrorComponentProps } from '@tanstack/react-router'

export function GlobalNotFound() {
  return (
    <main className='page'>
      <h1>404</h1>
      <p>Sorry, we couldn&rsquo;t find your page.</p>
      <Link to='/'>Back to main page</Link>
    </main>
  )
}

export function GlobalError({ error, reset }: ErrorComponentProps) {
  return (
    <main className='page'>
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred.'}</p>
      <button type='button' onClick={reset}>
        Try again
      </button>
    </main>
  )
}
