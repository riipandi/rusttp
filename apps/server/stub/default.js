// The entry a server built before the SPA loads (apps/server/build.rs writes it with a stub manifest).
document.getElementById('root').innerHTML =
  '<p style="font-family: system-ui, sans-serif; margin: 3rem">The web app is not built yet. Run <code>pnpm --filter webapp build</code>, then rebuild the server.</p>'
