[doc('Generate a secret key')]
[group('utility')]
generate-key:
    @openssl rand -base64 500 | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1

[doc('Remove build artifacts')]
[group('utility')]
cleanup:
    @echo "Removing build artifacts..."
    @cargo clean
    @pnpm dlx del-cli dist build tmp
