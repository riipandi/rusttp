# packages/uilibs

The shared React component library: StyleX styles over Base UI, compiled from source by each consumer. Rules: `.agents/docs/frontend.md` ("UI library"); inventory: `.agents/docs/ui-components.md`; styles: `.agents/docs/stylex-authoring.md` (and `stylex-installation.md` only for the compiler pipeline).

- Reuse a component from `ui-components.md` before writing one; a new or renamed one updates that file in the same change.
- StyleX only: every color, size, and motion value comes from `src/styles/` tokens; no `className` or raw `style` beside `stylex.props`; conditions nest in the value, never as top-level keys. Tokens change only on the owner's decision.
- A control takes `size` and composes `controlBase` or `controlPress` (`stylex-authoring.md`, "Controls"); built-in strings are one `labels` prop with English defaults; `uilibs` imports no i18n.
- Every component has a story; the story passes the a11y gate (`pnpm --filter uilibs test`, axe in light and dark). Never run Storybook and the test run together.
- `base` never imports from `extra` (except Button's `Spinner`).
