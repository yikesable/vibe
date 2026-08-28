import { voxpelli } from '@voxpelli/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    // vendor/ holds committed minified bundles — never linted.
    ignores: ['vendor/', 'node_modules/', 'coverage/**/*'],
  },
  voxpelli({
    env: ['browser'],
  }),
  // Node scripts and tests get Node globals (process, Buffer); the
  // browser components and bundle entries above keep browser-only
  // globals. Config files are Node too.
  voxpelli({
    env: ['node'],
    files: ['scripts/build-vendor.mjs', 'scripts/download-fonts.mjs', 'test/**/*.js', 'e2e/**/*.{js,mjs}', '*.config.mjs', '*.config.js'],
  }),
  // stylelint.config.mjs uses `null` semantically (stylelint severity
  // "off") — not a placeholder. Keep it.
  {
    files: ['stylelint.config.mjs'],
    rules: { 'unicorn/no-null': 0 },
  },
  {
    rules: {
      // We're in a browser, not in node.js
      'n/no-missing-import': 0,
      'n/no-unsupported-features/node-builtins': 0,
      // Doesn't work very well with querySelectorAll()
      'unicorn/prefer-spread': 0,
    },
  }
);
