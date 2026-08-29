// Regression guard for the <code-block> component's usage examples on
// index.html. The two "Usage:" examples were converted from the
// <script type="text/template"> path to the <pre><code> fallback path during
// the html-validate cleanup (raw text cannot represent </script>, and the
// pre path decodes entities). These tests prove the conversion renders
// decoded code, highlights it, and keeps the copy button working.
import { test, expect } from '@playwright/test';

const EXAMPLE_BLOCK_COUNT = 4;

test.describe('code-block usage examples on index.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('all usage examples render with real angle brackets, not entities', async ({ page }) => {
    const blocks = page.locator('code-block');
    await expect(blocks).toHaveCount(EXAMPLE_BLOCK_COUNT);

    // The rendered, highlighted code lives in the shadow DOM (.hljs);
    // the light DOM still carries the raw example markup.
    const codeBlockExample = blocks.nth(0).locator('code.hljs');
    await expect(codeBlockExample).toContainText(
      '<script type="module" src="https://yikesable.github.io/vibe/components/code-block.js"></script>'
    );
    await expect(codeBlockExample).not.toContainText('&lt;');
    await expect(codeBlockExample).not.toContainText('&gt;');

    // Converted kinetic-background usage example.
    const kineticExample = blocks.nth(3).locator('code.hljs');
    await expect(kineticExample).toContainText('<kinetic-background></kinetic-background>');
    await expect(kineticExample).not.toContainText('&lt;');

    // The untouched template-path example still renders (no regression).
    await expect(blocks.nth(1).locator('code.hljs')).toContainText('language="css"');
  });

  test('highlight.js is applied to every example', async ({ page }) => {
    await expect(page.locator('code-block code.hljs')).toHaveCount(EXAMPLE_BLOCK_COUNT);
  });

  test('the rendered code carries the declared language class', async ({ page }) => {
    // The language wiring (`class="language-${…}"`) is what highlight.js
    // keys off; all four examples declare language="html".
    const blocks = page.locator('code-block');
    for (let i = 0; i < EXAMPLE_BLOCK_COUNT; i++) {
      const renderedClass = await blocks.nth(i).evaluate((el) => el.shadowRoot.querySelector('code').className);
      expect(renderedClass).toContain('language-html');
    }
  });

  test('every example has a working copy button', async ({ page }) => {
    // Expand the "Show Examples" accordion so the template-path blocks
    // (1 and 2) are visible too.
    await page.locator('summary.c-accordion__summary').first().click();

    const blocks = page.locator('code-block');
    for (let i = 0; i < EXAMPLE_BLOCK_COUNT; i++) {
      const copyBtn = blocks.nth(i).locator('.copy-btn');
      await expect(copyBtn).toHaveText('Copy');
      await copyBtn.click();
      // Clipboard permission is granted in the context; a real write flips
      // the label for 2 seconds.
      await expect(copyBtn).toHaveText('Copied!');
    }
  });

  test('copy button writes the decoded code to the clipboard', async ({ page }) => {
    const block = page.locator('code-block').nth(0);
    await block.locator('.copy-btn').click();
    await expect(block.locator('.copy-btn')).toHaveText('Copied!');

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('components/code-block.js');
    expect(clip).not.toContain('&lt;');
    expect(clip).toContain('<script type="module"');
  });

  test('a rejected clipboard surfaces visibly instead of a console-only failure', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
    await page.goto('/index.html');

    // Reject deterministically — no permission-context games.
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new DOMException('denied', 'NotAllowedError'));
    });

    const copyBtn = page.locator('code-block').nth(0).locator('.copy-btn');
    await expect(copyBtn).toHaveText('Copy');
    await copyBtn.click();
    // The failure is on the button (aria-live announces it), not just in the
    // console — and it flips back so the button stays usable.
    await expect(copyBtn).toHaveText('Copy failed');
    await expect(copyBtn).toHaveText('Copy', { timeout: 4000 });
    expect(pageErrors).toEqual([]);
  });

  test('a real permission-denied clipboard surfaces the same visible failure', async ({ browser }) => {
    // The context fixture grants clipboard permissions (playwright.config.js);
    // a context WITHOUT the grant makes the browser itself reject writeText
    // with NotAllowedError — the real-world denial, not a stub.
    const context = await browser.newContext({ permissions: [] });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
    await page.goto('/index.html');

    const copyBtn = page.locator('code-block').nth(0).locator('.copy-btn');
    await expect(copyBtn).toHaveText('Copy');
    await copyBtn.click();
    await expect(copyBtn).toHaveText('Copy failed');
    await expect(copyBtn).toHaveText('Copy', { timeout: 4000 });
    expect(pageErrors).toEqual([]);
    await context.close();
  });
});
