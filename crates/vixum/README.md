# vixum

Server-rendered documents for a Vite SPA on axum. The Rust server owns the HTML document, so every page answers crawlers and link previews with its own head and HTTP status; Vite only compiles and serves modules and assets. The browser talks to one port in development and production.

## How a request is answered

| Request | Embedded (release, e2e) | Dev (`Vixum::dev`) |
| --- | --- | --- |
| Navigation (`GET`/`HEAD` asking for HTML) | The document: shell + page head + entry tags from the build manifest | The same document, run through Vite's `transformIndexHtml` (HMR client, React preamble, plugin tags) |
| Anything else | The assets router (e.g. memory-serve) | Proxied to the Vite dev server |
| Path with no route in the table | The document with 404; the SPA still renders its not-found page | Same, with the table read fresh from Vite |

A navigation is a `GET`/`HEAD` that asks for HTML or whose path has no extension, the same rule in both modes; paths under `/@` and `/__` (Vite's modules, the dev endpoints) never are. The build's `/.vite/*` and `/routes.json` answer 404. The HMR socket never passes through the server: the client connects to Vite directly, so a server restart does not reload the page.

## Usage

```rust
use vixum::{Page, Route, Shell, Vixum};

let shell = Shell::new("en")
    .head(include_str!("../stub/head.html")) // charset, icons, critical CSS
    .body(include_str!("../stub/body.html")); // the loader inside #root

let spa = if let Ok(origin) = std::env::var("VITE_DEV_SERVER") {
    Vixum::dev(shell, &origin, "/app/main.tsx")?
} else {
    let manifest = include_str!("../frontend/.vite/manifest.json");
    let routes = include_str!("../frontend/routes.json");
    Vixum::embedded(shell, manifest, routes, assets_router)?
};

let router = spa.into_router(|parts, route| async move {
    match route {
        Route::NotFound => Page::new("Not Found").status(StatusCode::NOT_FOUND).noindex(true),
        _ if route.param("vaultId") == Some("713") => Page::new("Vault 713 - Gringotts")
            .description("Where the Philosopher's Stone was kept.")
            .canonical("https://example.com/vaults/713"),
        _ => Page::new(route.title().unwrap_or("Gringotts")),
    }
});
```

The resolver is async and receives the request parts and the matched route (its params, title, and description), so a page can load its head from a database.

## API

- `Shell`: the static document around every page: `lang`, shared `head` markup, `body` markup inside the root element, `root_id` (default `root`). Trusted markup, written as is.
- `Page`: one page's head and status: `status`, `title`, `description`, `canonical`, `image` (Open Graph and a large Twitter card), `noindex`, `json_ld`, and raw `head`. Every value is HTML-escaped except `head`; JSON-LD escapes `<` so it cannot close its script.
- `Route`: what the route table says: `Matched { pattern, params, title, description }`, `NotFound`, or `Unknown` (no table). `route.param("vaultId")` reads a percent-decoded path param (a splat is `_splat`); `route.title()` and `route.description()` are the route's `staticData`.
- `Vixum::embedded(shell, manifest, routes, assets)` and `Vixum::dev(shell, origin, entry)` fail fast on a manifest without an entry chunk, JSON that does not parse, or an origin that is not absolute `http`.

## Vite side

The webapp has no `index.html`. Vite's build input is the entry module with `build.manifest: true`, and the `vixum` plugin (`packages/webapp/plugins/vixum.ts`):

- serves `POST /__vixum/transform?url=…` (the document through `transformIndexHtml`) and `GET /__vixum/routes.json` in dev;
- writes `routes.json` into the build output.

The route table comes from the route tree itself: the plugin loads it through Vite's SSR graph, builds a router over it, and writes every navigable full path with its `staticData.pageTitle` and `pageDescription` (the nearest up the parent chain):

```json
[{ "path": "/", "title": "Home" }, { "path": "/vaults/$vaultId", "title": "Vault", "description": "A vault at Gringotts." }]
```

So the title a crawler reads is the one the browser shows, from one place. Matching follows the router: static segments compare case-insensitively and win, then params with a static prefix or suffix (`report-{$year}.pdf`), then bare ones; `$param`, `{$param}`, an optional `{-$param}`, and a trailing `$` splat are supported. Query strings never take part in matching; the resolver reads them from the request. A `null` table answers 200 everywhere.

## Notes

- The entry tags are the entry chunk's script, its stylesheets and those of its static imports, and a `modulepreload` per static import, all from the site root.
- Documents are sent with `cache-control: no-cache`; cache the hashed assets in the assets router instead.
- Dev mode is meant for debug builds only: gate `Vixum::dev` behind `cfg(debug_assertions)`.
