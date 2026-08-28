import hljs from '../vendor/highlight.bundle.js';

class CodeBlock extends HTMLElement {
  constructor () { super(); this.shadow = this.attachShadow({ mode: 'open' }); }

  /**
   * Strip the common indentation of a code string.
   * @param {string} codeString — raw template or pre content.
   * @returns {string}
   */
  reIndent (codeString) {
    if (!codeString) return '';
    const lines = codeString.split('\n');
    if (lines.length <= 1) return codeString.trim();
    const firstLineWithContent = lines.find(line => line.trim() !== '');
    if (!firstLineWithContent) return '';
    const indentMatch = firstLineWithContent.match(/^\s*/);
    if (indentMatch === null) return '';
    const minIndent = indentMatch[0].length;
    return lines.map(line => line.length >= minIndent ? line.slice(Math.max(0, minIndent)) : line).join('\n').trim();
  }

  connectedCallback () {
    const template = this.querySelector('script[type="text/template"]');
    let code;
    if (template) {
      code = this.reIndent(template.innerHTML);
    } else {
      const preElement = this.querySelector('pre');
      if (!preElement) return;
      code = this.reIndent(preElement.textContent ?? '');
    }
    if (!code) return;

    this.shadow.innerHTML = `
            <style>
                :host { display: block; position: relative; }
                .code-block { font-family: 'Inter', monospace; background-color: #160f29; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1); overflow: auto; }
                pre { margin: 0; }
                .hljs { padding: 1rem; display: block; white-space: pre; color: #abb2bf; background: #160f29; }
                .hljs-comment, .hljs-quote { color: #5c6370; } .hljs-tag, .hljs-keyword { color: #c678dd; } .hljs-attribute, .hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-regexp { color: #d19a66; } .hljs-string { color: #98c379; } .hljs-title, .hljs-section, .hljs-name, .hljs-selector-id, .hljs-selector-class { color: #e06c75; } .hljs-type, .hljs-symbol, .hljs-bullet, .hljs-link { color: #61afef; }
                .copy-btn { position: absolute; top: 0.75rem; right: 0.75rem; background-color: rgba(0,0,0,0.2); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); font-family: 'Inter', monospace; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-size: 0.75rem; cursor: pointer; transition: all 0.2s ease-in-out; opacity: 0.5; z-index: 10; }
                :host(:hover) .copy-btn { opacity: 1; }
                .copy-btn:hover { background-color: rgba(0,0,0,0.4); }
                .copy-btn.copied { background-color: #16a34a; color: white; opacity: 1; }
            </style>
            <div class="code-block">
                <pre><code class="language-${this.getAttribute('language') || 'plaintext'}"></code></pre>
            </div>
            <button class="copy-btn">Copy</button>
        `;
    const codeContainer = this.shadow.querySelector('code');
    if (codeContainer === null) {
      return;
    }
    codeContainer.textContent = code;
    hljs.highlightElement(codeContainer);

    const btn = this.shadow.querySelector('.copy-btn');
    if (btn === null) {
      return;
    }
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = originalText; btn.classList.remove('copied'); }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    });
  }
}
customElements.define('code-block', CodeBlock);
