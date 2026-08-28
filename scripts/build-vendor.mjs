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
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const vendor = path.resolve(root, 'vendor');

await mkdir(vendor, { recursive: true });

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
  entryPoints: [path.resolve(here, 'highlight-entry.mjs')],
  format: 'esm',
  outfile: path.resolve(vendor, 'highlight.bundle.js'),
});
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 2. Three.js — ES module bundle for kinetic-background.js
//    (full module — tree-shaking gains are marginal with import * as THREE)
// ---------------------------------------------------------------------------
console.log('→ Building vendor/three.module.bundle.js ...');
await esbuild.build({
  ...shared,
  entryPoints: [path.resolve(root, 'node_modules/three/build/three.module.js')],
  format: 'esm',
  outfile: path.resolve(vendor, 'three.module.bundle.js'),
});
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 3. Three.js — UMD copy for jsdoc-types.html (global THREE)
// ---------------------------------------------------------------------------
console.log('→ Copying vendor/three.min.js ...');
await copyFile(
  path.resolve(root, 'node_modules/three/build/three.min.js'),
  path.resolve(vendor, 'three.min.js')
);
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 4. Prism — IIFE bundle: core + javascript/typescript/json/bash
// ---------------------------------------------------------------------------
console.log('→ Building vendor/prism.bundle.js ...');
await esbuild.build({
  ...shared,
  entryPoints: [path.resolve(here, 'prism-entry.mjs')],
  format: 'iife',
  outfile: path.resolve(vendor, 'prism.bundle.js'),
});
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 5. highlight.js CSS theme — copy atom-one-dark
// ---------------------------------------------------------------------------
console.log('→ Copying vendor/atom-one-dark.css ...');
await copyFile(
  path.resolve(root, 'node_modules/highlight.js/styles/atom-one-dark.css'),
  path.resolve(vendor, 'atom-one-dark.css')
);
console.log('  ✓ Done');

// ---------------------------------------------------------------------------
// 6. Prism theme CSS — copy okaidia
// ---------------------------------------------------------------------------
console.log('→ Copying vendor/prism-okaidia.css ...');
await copyFile(
  path.resolve(root, 'node_modules/prismjs/themes/prism-okaidia.css'),
  path.resolve(vendor, 'prism-okaidia.css')
);
console.log('  ✓ Done');

console.log('\n✅ All vendor bundles built in vendor/');
