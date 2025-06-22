import { voxpelli } from '@voxpelli/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  voxpelli({
    env: ['browser'],
  }),
  {
    rules: {
      // We're in a browser, not in node.js
      'n/no-unsupported-features/node-builtins': 0,
      // Doesn't work very well with querySelectorAll()
      'unicorn/prefer-spread': 0,
    },
  }
);
