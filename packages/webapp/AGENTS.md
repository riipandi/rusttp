# packages/webapp

The React SPA. Rules: `.agents/docs/frontend.md` (Layout, Webapp forms, state, i18n, accessibility, shortcuts, bundle, tests); components come from `uilibs` (`.agents/docs/ui-components.md`).

- Words are Paraglide messages from `const m = useMessages()` (`app/libraries/messages.ts`), never literals; importing `#/paraglide/messages` elsewhere is a lint error. Keys sit sorted ascending in every `app/locales/*.json`, the same keys in each (`frontend.md`, "Webapp i18n").
- Forms are Formisch with Valibot; the schema in `app/schemas/<domain>.schema.ts` is the only home of a rule. A component rendering a Formisch `field` starts with `'use no memo'` (`frontend.md`, "Traps").
- Shared state is a TanStack Store in `app/libraries/<name>.store.ts`; one-component state stays in `useState`.
- Sample values live in `app/fixtures/*.ts`, typed by their schema's `<Name>Response`.
- A new route goes into `packages/e2e/utils/routes.ts` (`allRoutes`) so the axe sweep covers it.
- Styles are StyleX from `uilibs` tokens (`.agents/docs/stylex-authoring.md`).
- Gates beyond `just verify`: `just test-web` for logic; `pnpm --filter webapp build` then `just size` for the entry budget; Playwright in `packages/e2e` for flows.
