# packages/uilibs

The shared React component library: StyleX styles over Base UI, compiled from source by each consumer. Rules: `.agents/docs/frontend.md` ("UI library"); catalog: `.storybook/stories/components.mdx`; styles: `.agents/docs/stylex-authoring.md` (and `stylex-installation.md` only for the compiler pipeline).

- Before building or changing any UI, read the catalog `.storybook/stories/components.mdx` and the component's `<name>.mdx`; reuse a component from it before writing one. A new, renamed, or removed component updates the catalog in the same change.
- StyleX only: every color, size, and motion value comes from `src/styles/` tokens; no `className` or raw `style` beside `stylex.props`; conditions nest in the value, never as top-level keys. Tokens change only on the owner's decision.
- A control takes `size` and composes `controlBase` or `controlPress` (`stylex-authoring.md`, "Controls"); built-in strings are one `labels` prop with English defaults; `uilibs` imports no i18n.
- Controls show only in `Playground` (`.storybook/preview.tsx` turns them off); its `include` list names them and its `render` reads the args (`frontend.md`, "UI library").
- Stories are grouped by prop axis (`Playground`, `Variants`, `Sizes`, `States`, behavior stories apart) with `Axis` from `src/contracts/story-axes.tsx` and the `play` helpers in `src/contracts/control-sizes.tsx`; no `minWidth` decorator and no `layout: 'centered'` (`frontend.md`, "UI library").
- Every component folder has a docs page, `<name>.mdx` (not `.stories.mdx`), beside its stories: import, anatomy, examples (`Canvas` of its stories), then the API reference with props, data attributes, and caveats; a prop, part, or attribute change updates it in the same commit (`frontend.md`, "UI library"). `styling.mdx` and `theming.mdx` in `.storybook/stories/` cover `style`, atoms, and the theme.
- Every component has a story; the story passes the a11y gate (`pnpm --filter uilibs test`, axe in light and dark). Never run Storybook and the test run together.
- `base` never imports from `extra` (except Button's `Spinner`).
