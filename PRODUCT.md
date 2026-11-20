# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers starting a new application from the template with `cargo generate riipandi/rusttp`. They work in a terminal and an editor, know Rust and TypeScript, run `just dev`, and replace the sample pages with their own product. The README calls it a personal-use template, so the first user is its author.

## Product Purpose

A monolith starter: one Rust binary (axum, clap) that serves its own React single-page app, with a Vite and TanStack Router frontend, a shared StyleX component library (`packages/uilibs`), email templates, and end-to-end tests, wired together so a new project begins with a working, tested whole. Success is a developer who generates the project, runs it, and is productive within minutes, with nothing to unpick.

## Positioning

The release build embeds the built SPA in the server binary, and the server renders the document and answers 404 from the route table, so the app ships and runs as one artifact with a typed Rust backend and a React frontend that were built to fit.

## Operating Context

Development runs through `just` recipes (`just dev` serves the Rust server with Vite behind it; `just storybook` serves the component library). The sample pages (home, sign in, 404, error) live in `packages/webapp/app/routes` and the components in `packages/uilibs`, documented in Storybook.

## Capabilities and Constraints

- The frontend is a client-rendered SPA served by the Rust server; there is no server-side React rendering.
- Components are StyleX and Base UI; the theme is light, dark, or system, applied through `data-theme` on the root element.
- The sign-in form is a placeholder: there is no sign-in endpoint yet, and submitting it opens the dashboard sample (`/dashboard`, dummy library-loan data).
- Sample data in fixtures, stories, and placeholder copy is drawn from Dan Brown's novels and Harry Potter (`.agents/docs/rules.md`, "Sample data").

## Brand Commitments

The name is Rusttp. The logo mark is the five-bar arch of `packages/webapp/public/favicon.svg` (`#d9531e`, `#fb8f5a` in dark), redrawn in `packages/webapp/app/components/logo.tsx`, orange on a neutral interface. The sample pages are a neutral baseline for adopters to replace, not an identity that derived projects must keep.

## Evidence on Hand

No customers, testimonials, benchmarks, or pricing exist, and none should be invented. Real content is the repository itself: `README.md`, `docs/`, `.agents/docs/`, and the Storybook stories.

## Product Principles

- Ship a working whole: the template runs, builds, and passes its checks before it is clever.
- Stay neutral: the sample UI shows the stack and the components without prescribing a brand.
- Everything is replaceable: a derived project removes or rewrites any sample page without touching the foundations.
- Say only what the repository can show: copy states real capabilities, never claims.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast of at least 4.5:1 (3:1 for large text), visible keyboard focus, labelled controls, and screen-reader support, in both light and dark themes.
