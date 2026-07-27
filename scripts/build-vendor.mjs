// Build script: bundles npm dependencies into vendor/ for self-hosting.
// Only vendor dependencies — never the project's own source code.
// Run: npm run build:vendor
//
// License compliance:
//   - `legalComments: 'external'` preserves third-party license headers
//     from bundled packages in separate .LEGAL.txt files
//   - Static copies (three.min.js, CSS themes) carry their original
//     license notices in-file — no extraction needed
//   - Font licenses are documented in assets/fonts/LICENSE-fonts.md

import esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const vendor = resolve(root, 'vendor');

mkdirSync(vendor, { recursive: true });

// Shared esbuild defaults
const shared = {
  bundle: true,
  minify: true,
  target: 'es2020',
  legalComments: 'external',   // preserve license notices as .LEGAL.txt
};

// ---------------------------------------------------------------------------
// 1. highlight.js — ES module bundle with only html/css/javascript
// ---------------------------------------------------------------------------
console.log('→ Building vendor/highlight.bundle.js ...');
await esbuild.build({
  ...shared,
  entryPoints: [resolve(here, 'highlight-entry.mjs')],
  format: 'esm',
  outfile: resolve(vendor, 'highlight.bundle.js'),
});
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 2. Three.js — ES module bundle for kinetic-background.js
//    (full module — tree-shaking gains are marginal with import * as THREE)
// ---------------------------------------------------------------------------
console.log('→ Building vendor/three.module.bundle.js ...');
await esbuild.build({
  ...shared,
  entryPoints: [resolve(root, 'node_modules/three/build/three.module.js')],
  format: 'esm',
  outfile: resolve(vendor, 'three.module.bundle.js'),
});
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 3. Three.js — UMD copy for jsdoc-types.html (global THREE)
// ---------------------------------------------------------------------------
console.log('→ Copying vendor/three.min.js ...');
copyFileSync(
  resolve(root, 'node_modules/three/build/three.min.js'),
  resolve(vendor, 'three.min.js')
);
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 4. Prism — IIFE bundle: core + javascript/typescript/json/bash
// ---------------------------------------------------------------------------
console.log('→ Building vendor/prism.bundle.js ...');
await esbuild.build({
  ...shared,
  entryPoints: [resolve(here, 'prism-entry.mjs')],
  format: 'iife',
  outfile: resolve(vendor, 'prism.bundle.js'),
});
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 5. highlight.js CSS theme — copy atom-one-dark
// ---------------------------------------------------------------------------
console.log('→ Copying vendor/atom-one-dark.css ...');
copyFileSync(
  resolve(root, 'node_modules/highlight.js/styles/atom-one-dark.css'),
  resolve(vendor, 'atom-one-dark.css')
);
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 6. Prism theme CSS — copy okaidia
// ---------------------------------------------------------------------------
console.log('→ Copying vendor/prism-okaidia.css ...');
copyFileSync(
  resolve(root, 'node_modules/prismjs/themes/prism-okaidia.css'),
  resolve(vendor, 'prism-okaidia.css')
);
console.log('  ✓ Done');

console.log('\n✅ All vendor bundles built in vendor/');