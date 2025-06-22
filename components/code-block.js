import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';

class CodeBlock extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    reIndent(codeString) {
        if (!codeString) return '';
        const lines = codeString.split('\n');
        if (lines.length <= 1) return codeString.trim();
        const firstLineWithContent = lines.find(line => line.trim() !== '');
        if (!firstLineWithContent) return '';
        const minIndent = firstLineWithContent.match(/^\s*/)[0].length;
        return lines.map(line => line.length >= minIndent ? line.substring(minIndent) : line).join('\n').trim();
    }
    connectedCallback() {
        const template = this.querySelector('script[type="text/template"]');
        let code;
        if (template) {
            code = this.reIndent(template.innerHTML);
        } else {
            const preElement = this.querySelector('pre');
            if (!preElement) return;
            code = this.reIndent(preElement.textContent);
        }
        if (!code) return;
        
        this.shadowRoot.innerHTML = `
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
        const codeContainer = this.shadowRoot.querySelector('code');
        codeContainer.textContent = code;
        hljs.highlightElement(codeContainer);

        const btn = this.shadowRoot.querySelector('.copy-btn');
        btn?.addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                console.log('w00t', btn);
                setTimeout(() => { btn.textContent = originalText; btn.classList.remove('copied'); }, 2000);
            }).catch(err => console.error('Failed to copy text: ', err));
        });
    }
}
customElements.define('code-block', CodeBlock);