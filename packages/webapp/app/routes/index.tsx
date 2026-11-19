import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  staticData: { pageTitle: 'Home' }
})

function RouteComponent() {
  return (
    <main className='page'>
      <h1>Rusttp</h1>
      <p>
        Edit <code>app/routes/index.tsx</code> to get started.
      </p>
      <footer>v{import.meta.env.PUBLIC_APP_VERSION}</footer>
    </main>
  )
}
