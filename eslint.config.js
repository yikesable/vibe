import { voxpelli } from '@voxpelli/eslint-config';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig(
  ...voxpelli({
    // vendor/ holds committed minified bundles — never linted.
    ignores: ['vendor/', 'node_modules/', 'coverage/**/*'],
    // ONE voxpelli() call only: its browserFiles/cliFiles profiles are
    // appended LAST inside the call, so they win over its own unscoped
    // base rules. A second voxpelli() call would re-append nodeRules
    // (n/no-unsupported-features/node-builtins: 'error') and
    // additionalRules (no-console: 'warn') unscoped AFTER these profiles —
    // and in flat config the last matching config wins, clobbering the
    // 'off's. e2e specs are hybrid (Node bodies driving page.evaluate
    // callbacks), so they get BOTH profiles: browser rules + Node globals.
    browserFiles: ['components/**/*.js', 'e2e/**/*.spec.js'],
    cliFiles: ['scripts/*.mjs', 'e2e/server.mjs'],
  }),
  // Node globals for scripts, tests, e2e, configs.
  {
    files: ['scripts/*.mjs', 'test/**/*.js', 'e2e/**/*.{js,mjs}', '*.config.mjs', '*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  // stylelint.config.mjs uses `null` semantically (stylelint severity
  // "off") — not a placeholder. Keep it.
  {
    files: ['stylelint.config.mjs'],
    rules: { 'unicorn/no-null': 0 },
  },
  // Test fixtures assert the `number | null` returns of parseHexColor —
  // legitimate null, not a placeholder.
  {
    files: ['test/**/*.js'],
    rules: { 'unicorn/no-null': 0 },
  },
  // The e2e server's dynamic fs paths are design (traversal-guarded,
  // read-only e2e scope) — the one thing cliFiles doesn't cover. Same for
  // download-fonts' staged writes (paths derived from the fixed FONTS
  // config array, never user input).
  {
    files: ['e2e/server.mjs', 'scripts/download-fonts.mjs'],
    rules: { 'security/detect-non-literal-fs-filename': 0 },
  },
  {
    rules: {
      // Doesn't work very well with querySelectorAll()
      'unicorn/prefer-spread': 0,
    },
  }
);
