Run pnpm/action-setup@v4
Running self-installer...
Error: Multiple versions of pnpm specified: - version 9 in the GitHub Action config with the key "version" - version pnpm@9.12.3+sha512.cce0f9de9c5a7c95bef944169cc5dfe8741abfb145078c0d508b868056848a87c81e626246cb60967cbd7fd29a6c062ef73ff840d96b3c86c40ac92cf4a813ee in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
at readTarget (/home/runner/work/\_actions/pnpm/action-setup/v4/dist/index.js:1:4742)
at runSelfInstaller (/home/runner/work/\_actions/pnpm/action-setup/v4/dist/index.js:1:3930)
at async install (/home/runner/work/\_actions/pnpm/action-setup/v4/dist/index.js:1:3154)
at async main (/home/runner/work/\_actions/pnpm/action-setup/v4/dist/index.js:1:445)
Error: Error: Multiple versions of pnpm specified: - version 9 in the GitHub Action config with the key "version" - version pnpm@9.12.3+sha512.cce0f9de9c5a7c95bef944169cc5dfe8741abfb145078c0d508b868056848a87c81e626246cb60967cbd7fd29a6c062ef73ff840d96b3c86c40ac92cf4a813ee in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
