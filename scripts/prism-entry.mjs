// Entry point for esbuild — bundles Prism core + languages used in jsdoc-types.html
// Languages used: javascript, typescript, json, bash
// Prism attaches to self.Prism (global) via side-effect; the IIFE format makes this work.

import 'prismjs/components/prism-core';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

export default (typeof globalThis !== 'undefined' ? globalThis.Prism : undefined);
