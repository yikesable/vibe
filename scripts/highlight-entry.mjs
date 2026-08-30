// Entry point for esbuild — bundles only the highlight.js languages this project needs.
// Uses CJS paths resolved through node_modules which esbuild bundles into ESM.
// code-block.js uses: xml (covers HTML), css (from index.html usage)
// codepen-converter uses: xml, css, javascript (from hljs.highlightElement on output panels)

import hljsCore from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';

hljsCore.registerLanguage('xml', xml);
hljsCore.registerLanguage('css', css);
hljsCore.registerLanguage('javascript', javascript);

export { default } from 'highlight.js/lib/core';
