// Entry point for esbuild — bundles Prism core + languages used in jsdoc-types.html
// Languages used: javascript, typescript, json, bash
// Prism attaches to self.Prism (global) via side-effect; the IIFE format makes this work.
//
// CVE-2024-53382 assessment (2026-08-29, prismjs 1.30.0 — patched release):
// the DOM-clobbering XSS (GHSA-x7hr-w5r2-h6wg) exploits Prism PLUGIN code paths
// (autoloader, previewers, etc.) that look up named elements. This bundle ships
// core + grammars only — no plugins — and the sole consumer
// (stories/jsdoc-types.html) calls Prism.tokenize() directly and builds token
// DOM itself. No clobbering-relevant code path exists. Re-verify if plugins are
// ever added to this entry.

import 'prismjs/components/prism-core';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

export default (typeof globalThis !== 'undefined' ? globalThis.Prism : undefined);
