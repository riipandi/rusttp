[doc('Run E2E tests headless')]
[group('e2e')]
[no-exit-message]
[positional-arguments]
e2e-test *args:
    @pnpm --filter e2e test "$@"

[doc('Run E2E in Chromium')]
[group('e2e')]
[no-exit-message]
[positional-arguments]
e2e-chrome *args:
    @pnpm --filter e2e test:chrome "$@"

[doc('Run E2E in Firefox')]
[group('e2e')]
[no-exit-message]
[positional-arguments]
e2e-firefox *args:
    @pnpm --filter e2e test:firefox "$@"

[doc('Run E2E in Safari')]
[group('e2e')]
[no-exit-message]
[positional-arguments]
e2e-safari *args:
    @pnpm --filter e2e test:safari "$@"

[doc('Run E2E on iPhone 16')]
[group('e2e')]
[no-exit-message]
[positional-arguments]
e2e-mobile *args:
    @pnpm --filter e2e test:mobile "$@"

[doc('Open Playwright UI')]
[group('e2e')]
[no-exit-message]
e2e-ui:
    @pnpm --filter e2e test:ui

[doc('Open last E2E report')]
[group('e2e')]
[no-exit-message]
e2e-report:
    @pnpm --filter e2e report

[doc('Install E2E browsers')]
[group('e2e')]
e2e-install:
    @pnpm --filter e2e install-browsers
