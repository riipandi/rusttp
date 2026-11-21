# UI Components Index

updated: 2026-11-20T06:09:00+07:00

The inventory of `packages/uilibs/src`: what each component is, where it imports from, and what it is built on. Check it before writing a new component; extend an existing one when it already covers the need. The tree is a port of the shared library of the `saka` project; `packages/webapp` consumes it (`uilibs` dependency, StyleX plugin in its Vite config, `UIProvider` and `ThemeProvider` at the root; see `shape.md`).

## How to use and extend

- **Import path.** `uilibs/<path under src>`, resolved by the package `exports` map (`./src/*`, `./src/*/index.ts`, `./src/*.ts`, `./src/*.tsx`): `uilibs/base/button`, `uilibs/extra/card`, `uilibs/styles/tokens.stylex`, `uilibs/theme`. Inside the package, use the `#/*` alias (`src/*`) or a relative path.
- **Anatomy.** One folder per component, `<name>/{<name>.component.tsx, <name>.stylex.ts, <name>.stories.tsx, index.ts}`; `index.ts` re-exports the component and its styles. Exceptions: `base/provider.tsx` (one file), `extra/input-password` (no styles file), `extra/data-grid` and `extra/sortable`/`extra/kanban` (larger modules), `charts/` (primitives plus one story per chart type), `icons/` (one file per brand).
- **Styling.** StyleX only. Colors, spacing, type, radius, motion, and z-index come from `src/styles/` (`colors.stylex.ts`, `tokens.stylex.ts`, `popup.stylex.ts`, `utils.stylex.ts`, `themes.ts`), never from literals or non-StyleX imports. A component accepts `style` (StyleX styles) and merges it last in `stylex.props(...)`; it never takes `className` or a raw `style` object. Authoring rules: `stylex-authoring.md`; build setup: `stylex-installation.md`.
- **Controls.** Every form control takes `size` (`sm` 32, `md` 36 default, `lg` 40; `xs` 28 on Button, Toggle, and Tabs) so a row of mixed controls shares one height; `size` sits on the part that is the box (`Input`, `SelectTrigger`, `ComboboxInput`/`ComboboxTrigger`/`ComboboxChips`, `AutocompleteInput`, `Textarea`) or on the root that holds the parts (`NumberField`, `OTPField`, `InputGroup`, `InputPassword`, `InputPhone`, `TabsList`, `Menubar`). A text control fills its container. Textarea, FileUpload, and Slider are Field controls like the rest. Built-in strings are `labels` props with English defaults; wrappers take `ref` as a prop. The recipes are in `stylex-authoring.md` ("Controls").
- **Primitives.** Base UI (`@base-ui/react`) for behaviour and accessibility; a component's header comment links the Base UI page and shows its anatomy. TanStack Table v9 and `@tanstack/react-virtual` (data grid), `@tanstack/charts` (charts), `react-day-picker` (calendar), `react-phone-number-input` (phone input), `react-resizable-panels` (resizable), `@dnd-kit/*` (kanban, sortable).
- **Stories.** Every component has `*.stories.tsx` beside it; `just storybook` serves them. Sample data follows `rules.md` ("Sample data").
- **Theme.** `uilibs/theme` (`ThemeProvider`, `useTheme`, `ThemeSwitcher`, `ThemeScript` from `uilibs/theme/theme-script` to set the theme before first paint); `data-theme` on the root carries `light`/`dark`. `UIProvider` (`base/provider`) sets CSP nonce and text direction for Base UI and goes at the app root.

---

## 1. Base (`uilibs/base/*`)

Thin, styled wrappers over Base UI parts; the part names mirror Base UI's anatomy.

| Component | Import path | Description |
| :--- | :--- | :--- |
| **Accordion** | `uilibs/base/accordion` | Collapsible panels with headings. |
| **Alert Dialog** | `uilibs/base/alert-dialog` | Dialog that needs a user response; for destructive or high-risk confirmations. `AlertDialogAction` and `AlertDialogCancel` both close it; call `event.preventBaseUIHandler()` in the action's `onClick` to keep it open while work runs. |
| **Autocomplete** | `uilibs/base/autocomplete` | Input that suggests options as you type; `size` on `AutocompleteInput`. |
| **Avatar** | `uilibs/base/avatar` | Image with a fallback. |
| **Button** | `uilibs/base/button` | `variant` (default `primary`) and `size` (`xs`, `sm`, `md` default, `lg`, plus `icon-xs`/`icon-sm`/`icon-md`/`icon-lg`); `loading` shows a spinner over the label, keeps the width and the name, and sets `aria-busy` (disabled but focusable). A link is a `LinkButton` (`render={<a href='…' />}` or `render={<Link to='…' />}`, `current` for `aria-current='page'`), which restores `role='link'`; `Button` itself can render another tag with `nativeButton={false}`, but it is then announced as a button. |
| **Checkbox** | `uilibs/base/checkbox` | Checkbox and checkbox group. |
| **Collapsible** | `uilibs/base/collapsible` | One expandable panel. |
| **Combobox** | `uilibs/base/combobox` | Searchable select; `ComboboxChips` for multiple values. `size` on `ComboboxInput`, `ComboboxTrigger`, and `ComboboxChips`; `labels` (`clear`, `open`) on the input and `removeLabel` on a chip (default `Remove <chip text>`). Name a standalone input or trigger with `aria-label`. |
| **Context Menu** | `uilibs/base/context-menu` | Menu at the pointer on right click or long press; its items are the dropdown menu's. |
| **Dialog** | `uilibs/base/dialog` | Modal popup over the page; `labels.close` names the built-in close button (`showCloseButton={false}` removes it). |
| **Drawer** | `uilibs/base/drawer` | Panel sliding in from an edge. |
| **Dropdown Menu** | `uilibs/base/dropdown-menu` | Action menu (Base UI `Menu`); keep `DropdownMenuLabel` inside a `DropdownMenuGroup`. |
| **Field** | `uilibs/base/field` | Label, description, and validation around a control; also `FieldSet`, `FieldLegend`, `FieldGroup`. |
| **Form** | `uilibs/base/form` | Native form with consolidated error handling. |
| **Input** | `uilibs/base/input` | Text input; `size`. |
| **Menubar** | `uilibs/base/menubar` | Desktop-style menu bar; `size` on `Menubar`. |
| **Meter** | `uilibs/base/meter` | Numeric value within a range. |
| **Navigation Menu** | `uilibs/base/navigation-menu` | Links and menus for site navigation; `labels` name its two `nav` landmarks. |
| **Number Field** | `uilibs/base/number-field` | Numeric input with steppers and a scrub area; `size` on `NumberField`, `labels` (`increase`, `decrease`) on the group. |
| **OTP Field** | `uilibs/base/otp-field` | One-time code input in character slots; `size` on `OTPField`. An `aria-label` on the root names the first slot, the others are named `Character n of N` (`labels.slot`). |
| **Popover** | `uilibs/base/popover` | Rich content in a portal, opened by a trigger; `PopoverContent` takes `side`, `align`, `alignOffset`, `sideOffset`, `collisionAvoidance`, and `collisionPadding`. |
| **Preview Card** | `uilibs/base/preview-card` | Rich preview shown on hover or focus of a link. |
| **Progress** | `uilibs/base/progress` | Progress of a long task. |
| **Provider** | `uilibs/base/provider` | `UIProvider`: CSP nonce and text direction for Base UI. |
| **Radio** | `uilibs/base/radio` | Radio and radio group. |
| **Scroll Area** | `uilibs/base/scroll-area` | Styled scroll container. |
| **Select** | `uilibs/base/select` | Single-choice list in a popup; `size` on `SelectTrigger`. Name a standalone trigger with `aria-label`. |
| **Separator** | `uilibs/base/separator` | Visual divider. |
| **Slider** | `uilibs/base/slider` | Value or range from a track; one thumb unless the value is an array, `thumbLabels` (or `aria-label` for one thumb) names the thumbs. |
| **Switch** | `uilibs/base/switch` | On/off toggle. |
| **Tabs** | `uilibs/base/tabs` | Content split into tabbed panels; `size` (`xs` to `lg`) and `variant` on `TabsList`. |
| **Toast** | `uilibs/base/toast` | Stacked notifications and anchored toasts, positioning configurable; `toast(title, { tone })` (`success` and `error` imply `positive` and `critical`), `labels` on `Toaster` (`close`, `notification`). |
| **Toggle** | `uilibs/base/toggle` | Pressed/unpressed button; `size` `xs` 28 to `lg` 40. |
| **Toggle Group** | `uilibs/base/toggle-group` | Connected group of toggles; `size` as Toggle. |
| **Toolbar** | `uilibs/base/toolbar` | Container for toolbar items. |
| **Tooltip** | `uilibs/base/tooltip` | Hint on hover or focus; mount `TooltipProvider` once above its users. |

---

## 2. Extra (`uilibs/extra/*`)

Compositions and components Base UI does not provide.

| Component | Import path | Parts and description |
| :--- | :--- | :--- |
| **Alert** | `uilibs/extra/alert` | `Alert` (`tone`; a polite `status` by default, `role='alert'` to interrupt, `role={undefined}` to not announce), `AlertTitle` (`level` 1 to 6, default 5), `AlertDescription`, `AlertAction` (top-right slot for a dismiss or undo). |
| **Aspect Ratio** | `uilibs/extra/aspect-ratio` | Fixed-ratio container. |
| **Badge** | `uilibs/extra/badge` | Compact status label: `variant` (`primary` solid, `secondary` faded, `outline`, `ghost`) and `tone` (`neutral`, `primary`, `positive`, `warning`, `critical`; `primary` for the solid variant and `neutral` for the others by default). |
| **Breadcrumb** | `uilibs/extra/breadcrumb` | `Breadcrumb`, `List`, `Item`, `Link`, `Page`, `Separator`, `Ellipsis` (`label`). |
| **Button Group** | `uilibs/extra/button-group` | Fuses its children into one segmented control by cloning element children with position styles through `style`, so every child must accept `style` (a wrapper that does not, such as a menu root, is styled by hand); Fragments are opened up, text is kept, and filled Buttons get a divider where bordered children share an edge. |
| **Calendar** | `uilibs/extra/calendar` | Date picker on `react-day-picker`, with Base UI selects for month and year; a day's name starts with its visible number (override through `labels.labelDayButton`). |
| **Card** | `uilibs/extra/card` | `Card`, `Header`, `Title`, `Description`, `Action`, `Content`, `Footer`. |
| **Command** | `uilibs/extra/command` | Command palette on Base UI Autocomplete in `inline open` mode: pass `items` to the root; `CommandList` takes a render function over the filtered items. |
| **Data Grid** | `uilibs/extra/data-grid` | Virtualized TanStack Table grid: column pinning and reordering, inline cell editing, drag-and-drop rows, infinite loading, footers, pager; exports `DataGrid`, `DataGridContainer`, `DataGridProvider`, `useDataGrid`. |
| **Description List** | `uilibs/extra/description-list` | `DescriptionList`, `DescriptionTerm`, `DescriptionDetails`: key-value rows with hairlines; terms and details are direct children of the list. |
| **Empty** | `uilibs/extra/empty` | `Empty`, `Header`, `Media`, `Title`, `Description`, `Content`. |
| **File Upload** | `uilibs/extra/file-upload` | Drag-and-drop area and a Field control; the whole area stays clickable through its label, and a drop honors the input's `accept` and `multiple`. |
| **Icon** | `uilibs/extra/icon` | Wrapper for SVG assets: inherits `currentColor`, `color` applies a foreground token, size defaults to `1em`. |
| **Input Group** | `uilibs/extra/input-group` | `InputGroup` (`size`), `Addon`, `Button` (`xs`, `icon-xs`, `icon-sm`), `Text`, `Input`, `Textarea`. |
| **Input Password** | `uilibs/extra/input-password` | Password input with a visibility toggle, on `InputGroup`; `size`. |
| **Input Phone** | `uilibs/extra/input-phone` | International phone input with a searchable country selector; `size`, `labels` (`selectCountry`, `searchCountry`, `noCountry`). |
| **Item** | `uilibs/extra/item` | `ItemGroup`, `Item` (a `listitem` inside a group), `Media`, `Content`, `Title`, `Description`, `Actions`, `Header`, `Footer`, `Separator`: one-column rows; multi-column records use `Table`. |
| **Kanban** | `uilibs/extra/kanban` | dnd-kit board with column and item drag-and-drop; `labels.columnHandle`; item ids must be unique across columns. |
| **Kbd** | `uilibs/extra/kbd` | `Kbd`, `KbdGroup`: keyboard shortcut label (only the label; the listener is separate, `@tanstack/react-hotkeys`, and the webapp renders a hotkey as keycaps through `components/shortcut.tsx`). |
| **Label** | `uilibs/extra/label` | Standalone label, for use outside a `Field`. |
| **Loader Text** | `uilibs/extra/loader-text` | Animated text placeholder. |
| **Pagination** | `uilibs/extra/pagination` | `Pagination`, `Content`, `Item`, `Link` (a `LinkButton`, so `role='link'`), `Previous`, `Next`, `Ellipsis` (`label`). |
| **Resizable** | `uilibs/extra/resizable` | Resizable panel groups on `react-resizable-panels`; `orientation` is the panel flow direction. |
| **Sheet** | `uilibs/extra/sheet` | Dialog-based overlay from `top`, `right`, `bottom`, or `left`: `Sheet`, `Trigger`, `Close`, `Portal`, `Overlay`, `Content` (`labels.close`), `Header`, `Footer`, `Title`, `Description`. |
| **Skeleton** | `uilibs/extra/skeleton` | Pulse placeholder block. |
| **Sortable** | `uilibs/extra/sortable` | dnd-kit reorderable list: `Sortable` (`value`, `onValueChange`, `getItemValue`, `labels.handle`), `SortableItem`, `SortableItemHandle`; an item with a handle is dragged by the handle only, so it can hold other controls. |
| **Spinner** | `uilibs/extra/spinner` | Busy indicator (Keyline `LoaderCircle`): a `status` named `label` on its own, hidden from assistive technology inside a Button. |
| **Table** | `uilibs/extra/table` | `Table`, `Header`, `Body`, `Footer`, `Row`, `Head`, `Cell`, `Caption`; give an icon-only header `visuallyHidden` text. |
| **Text** | `uilibs/extra/text` | Typography: `variant` (`headline-1`..`3`, `featured-1`..`6` (render `h1`..`h6`; the rest render `div`), `body-1`/`2`, `caption-1`/`2`), `color`, `weight`, `align`, `maxLines`; `variant`, `weight`, and `align` take a value or one per breakpoint (`s`/`m`/`l`/`xl`). Renders the tag its variant implies unless `render` overrides it. |
| **Textarea** | `uilibs/extra/textarea` | Multiline input and a Field control; `size` sets a minimum height (`sm` 56, `md` 64, `lg` 72) and the type, `autoResize`. |

---

## 3. Charts, icons, and foundations

- **Charts (`uilibs/charts`).** shadcn-style primitives on TanStack Charts: `ChartContainer` (takes `config`), `Chart` (takes a `defineChart()` definition, `ariaLabel`, `height`), `ChartLegend`, `useChartConfig`. A series key in `config` matches a mark `id`. Mark colors must be concrete color strings (TanStack paints them as SVG attributes, which do not resolve CSS variables); give each chart in a document an explicit `idPrefix`. `charts/stories/` holds one recipe per chart type: area, bar, bar list, Bollinger band, boxplot, category bar, combo, cumulative histogram, donut, dumbbell, heatmap, line, lollipop, progress circle, scatter plot, slopegraph, spark chart, tracker; `chart.samples.tsx` is story data, not public.
- **Brand icons (`uilibs/icons`).** `FacebookIcon`, `GitHubIcon`, `GoogleIcon`, `InstagramIcon`, `LinkedInIcon`, `TelegramIcon`, `ViteIcon`, `WhatsAppIcon`, `XIcon`. General-purpose icons come from `@keyline-icons/react`, wrapped by `Icon` for sizing.
- **Styles (`uilibs/styles/*`).** `control.stylex` (`ControlSize`, `DenseControlSize`, `controlSizes`, `controlBase`, `controlPress`), `tone` (the `Tone` type), `colors.stylex` (color and `shadow` variables, with `borderControl` for control edges; `backgroundDisabled*`, `backgroundElevationRaised`, and the `*-intense` shadows were removed; the primary and `brand` ramp is the logo's orange, hue 39.4 in light and 45.84 for dark foregrounds and borders, kept at 4.5:1 or better against `onBackgroundPrimary` for WCAG AA), `tokens.stylex` (fonts, `fontSize`, `unit`, `stroke`, `container`, `radius`, `zIndex`, `viewport`, `breakpoints`, `duration`, `easing`), `popup.stylex` (`popupFx`), `utils.stylex` (`ring`, the box-shadow edge for popups; use it instead of a border on popups; `visuallyHidden`, text for assistive technology only), `themes` (dark theme class).
- **Hooks (`uilibs/hooks/use-media-query`).** `useMediaQuery`, `useIsMobile`.
- **Assets (`uilibs/assets/*.css`).** `reset.css` (layer `reset`), `fontface.css`, `globals.css`; the StyleX plugin pins its layers after `reset` (`packages/plugins/src/stylex.ts`).
