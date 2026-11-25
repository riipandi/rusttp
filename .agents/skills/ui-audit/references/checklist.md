# UI audit checklist

Each line is a question with the contract it comes from. A "no" with evidence is a finding.

## Accessibility

- Does every page have one `h1`, a `SkipLink` as the first Tab stop, and named landmarks? (`frontend.md`, "Webapp accessibility")
- Does every field have a visible `FieldLabel` above it, and is the OTP field named by it?
- Does each control's accessible name contain its visible text (WCAG 2.5.3)? Does a state toggle keep one name and one element, with `aria-expanded`?
- Does Tab reach every control in visual order, with a visible focus ring (`focusRing.root`), and does focus land somewhere sensible after a dialog or popover closes?
- Is every icon-only control and empty table header named (`visuallyHidden` or `aria-label`)?
- Are live changes announced (form errors, toasts, notification counts) and drag operations described (`labels` announcements)?
- Is a scroll container a named, focusable region?
- Does a new route appear in `packages/e2e/utils/routes.ts` (`allRoutes`)?

## Contrast and color

- Text 4.5:1 and control edges 3:1 in both themes, on the page and on neutral surfaces? (`frontend.md`, "UI library", the measured `borderControl` values)
- Chart series on `foreground*` tokens, or labelled when the color carries meaning?
- Is meaning ever carried by color alone?

## StyleX and the design system

- Any literal color, size, duration, or z-index instead of a `src/styles/` token? (`stylex-authoring.md`)
- Any `className`, raw `style`, top-level pseudo-class or media query, or non-StyleX import in a style?
- Does each control take `size` and compose `controlBase` or `controlPress`, with the caller's `style` last?
- Does a webapp page reuse a `uilibs` component that already exists (the catalog, `packages/uilibs/.storybook/stories/components.mdx`), and use `PageTitle`, `layoutSize`, `breakpoints`?
- Does `base` import from `extra` (other than Button's `Spinner`)?

## Responsive layout

- Any horizontal overflow at 390px? Does a control that must fit a phone shrink instead?
- At 767/768px, does the admin layout render exactly one of the sidebar and the top bar?
- Do long `id` strings wrap or truncate without breaking the layout?

## Stories

- Is each component's story file `Playground`, then one story per prop axis (`Variants`, `Colors`, `Sizes`, `States`, `Orientations`, `Sides`), then behavior stories, with every axis drawn by `Axis` and asserted in its `play`? (`frontend.md`, "UI library")
- Does a story set a `minWidth` or `layout: 'centered'`, so the 390 px layout cannot show? Does any story overflow horizontally at 390 px?

## Motion and system modes

- Does every animation have a `prefers-reduced-motion` branch (`motion.reduce`)?
- Under forced colors, do states drawn with a background or shadow get an outline or system color?
- Does dark mode come only from `data-theme` and `themes.ts`?

## i18n

- Any literal word in a component instead of `useMessages()`? Any message read at module load?
- Are keys sorted and present in every locale? Is a sentence ever cut around a link?
- Are dates and numbers formatted by `useFormat()`, never pre-formatted in a fixture or schema?
- Do `uilibs` strings arrive through `labels`?

## Forms

- Does the schema own every rule? Does each component rendering a Formisch `field` start with `'use no memo'`?
- Does a failed submit show the first error and move focus to the first invalid control? Do errors follow a language change (`useRevalidateOnLocale`)?

## Performance

- Is the entry load within budget (`just size`)? Did a root provider or barrel import pull a chunk into the entry?
- Does a list or table that can grow use virtualization (the data grid) rather than rendering every row?

## Sample data

- Do fixtures, stories, and placeholders follow `rules.md` ("Sample data"), and live in `app/fixtures/*.ts` in the webapp?
