# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-22

### Added

- Admin command bar (Cmd/Ctrl+K) with rebindable keyboard shortcuts, a shortcuts cheat sheet, and go-to sequences (`G` then `O`/`U`/`N`/`S`).
- Notifications popover with quick actions in the customer header and the admin sidebar and top bar, backed by one shared store.
- Admin sidebar: remembers its collapsed state, folds to the icon rail on settings pages, and keeps keyboard focus on a single toggle.
- English and Indonesian interface (Paraglide). Switching language re-renders in place, so typed input, open menus, and focus survive. Dates, relative times, and numbers follow the language (`Intl`).
- Skip-to-content link, visible labels on every form field, and a named, focusable region around scrollable tables.
- Kanban and Sortable announce drag moves to screen readers by item name, in the language given through `labels`.
- Button and menu items take `tone='critical'`; Pagination, Breadcrumb, InputPassword, Spinner, Command, Combobox chips, and close buttons take a single `labels` object.
- E2E sweep: every route at 390px and 1440px, light and dark, must have no axe violation and no horizontal overflow.
- Announcement bar, and the React Compiler build for the web app.

### Changed

- **Breaking (`uilibs`)**: `variant='destructive'` is now `tone='critical'`; the string props `text`, `label`, `title`, `showAriaLabel`, `hideAriaLabel`, and `removeLabel` are replaced by `labels`.
- Settings pages are grouped (Authentication, Federation, Security, System); two-factor lives at `/two-factor`; device codes accept letters and digits.
- Schemas are grouped by domain, and sample data lives in `app/fixtures`. Loan dates, notification times, and counts are ISO values and numbers.
- Shared layout constants, `PageTitle`, and a shared focus-ring style replace copied styles.

### Fixed

- Disabled Checkbox, Switch, and Radio looked enabled.
- The one-time code overflowed 390px screens on `/two-factor` and `/device`.
- Wide tables could not be scrolled with the keyboard.
- Account and search buttons now contain their visible text in their accessible name; the 404 page has an `h1`; the settings picker sits in a landmark.
- Forced-colors and reduced-motion support for Slider, Switch, Progress, Meter, Tabs, Resizable, Spinner, and Skeleton; the slider thumb now shows keyboard focus; the global rule that hid focus outlines on touch devices is gone.
- Placeholder copy no longer shows in the interface.

[0.2.0]: https://github.com/riipandi/rusttp/compare/v0.1.0...v0.2.0
