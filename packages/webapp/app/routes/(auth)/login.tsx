import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  staticData: { pageTitle: 'Sign in' }
})

function RouteComponent() {
  return (
    <main className='page'>
      <h1>Sign in</h1>
      <p>
        Edit <code>packages/webapp/app/routes/(auth)/login.tsx</code> to get started.
      </p>
      <footer>v{import.meta.env.PUBLIC_APP_VERSION}</footer>
    </main>
  )
}
