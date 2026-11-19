import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
  staticData: { pageTitle: 'Home' }
})

function RouteComponent() {
  return (
    <main className='page'>
      <h1>Rusttp</h1>
      <p>
        Edit <code>packages/webapp/app/routes/(app)/index.tsx</code> to get started.
      </p>
      <footer>v{import.meta.env.PUBLIC_APP_VERSION}</footer>
    </main>
  )
}
