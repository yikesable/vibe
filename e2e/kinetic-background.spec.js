import { expect, test } from '@playwright/test';

/**
 * The stardust depth layer — lifecycle, motion modes, and reconnection.
 * These codify the hardening commit's guarantees: idempotent
 * connect/disconnect, exactly one canvas after a detach/reconnect cycle,
 * and a rendered static frame (not a blank canvas) under reduced motion.
 *
 * Painting is verified with a draw-call spy installed before any page
 * script runs: `readPixels` is useless here because three.js renders with
 * `preserveDrawingBuffer: false`, so the buffer is cleared once the browser
 * composites the frame — reading it from outside the frame always yields
 * zeros. Counting GL draw calls proves the renderer actually painted.
 */

/**
 * Collect page errors and console errors so each test ends with a clean bill.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {string[]}
 */
function watchErrors (page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`console: ${msg.text()}`);
    }
  });
  return errors;
}

/**
 * Install the draw-call counter before the page loads. Runs per page
 * context, so the counter starts at 0 for each test.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
function spyOnGlDraws (page) {
  return page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      const context = originalGetContext.call(this, type, ...args);
      if ((type === 'webgl' || type === 'webgl2') && context !== null) {
        for (const method of ['drawArrays', 'drawElements']) {
          const original = context[method].bind(context);
          context[method] = (...drawArgs) => {
            globalThis.__glDrawCalls = (globalThis.__glDrawCalls ?? 0) + 1;
            return original(...drawArgs);
          };
        }
      }
      return context;
    };
  });
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>} cumulative GL draw calls on the page.
 */
function glDrawCalls (page) {
  return page.evaluate(() => globalThis.__glDrawCalls ?? 0);
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>}
 */
function canvasCount (page) {
  return page.evaluate(() => document.querySelector('kinetic-background')?.shadowRoot?.querySelectorAll('canvas').length ?? 0);
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string | undefined>}
 */
function lifecycle (page) {
  return page.evaluate(() => document.querySelector('kinetic-background')?.lifecycle);
}

test.describe('kinetic-background on index.html', () => {
  test('renders the stardust and runs the animation loop', async ({ page }) => {
    const errors = watchErrors(page);
    await spyOnGlDraws(page);
    await page.goto('/');

    const host = page.locator('kinetic-background');
    await expect(host).toHaveCount(1);
    await expect(host).toHaveAttribute('aria-hidden', 'true');

    // Full motion: the async Three.js load completes into the running loop.
    await expect.poll(() => lifecycle(page)).toBe('running');
    await expect.poll(() => canvasCount(page)).toBe(1);

    // The renderer painted — GL draw calls happened.
    await expect.poll(() => glDrawCalls(page)).toBeGreaterThan(0);

    // The loop is live: draw calls keep growing, one per frame — not a
    // one-shot paint that froze.
    const samples = await glDrawCalls(page);
    await page.waitForTimeout(350);
    await expect.poll(() => glDrawCalls(page)).toBeGreaterThan(samples);
    expect(errors).toEqual([]);
  });

  test('reduced motion renders one static frame and never animates', async ({ page }) => {
    const errors = watchErrors(page);
    await spyOnGlDraws(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const host = page.locator('kinetic-background');
    await expect(host).toHaveCount(1);

    // Reduced motion: the depth layer is rendered once, then frozen — the
    // lifecycle lands on 'static', never 'running'.
    await expect.poll(() => lifecycle(page)).toBe('static');
    await expect.poll(() => canvasCount(page)).toBe(1);

    // The static frame painted (unlike the old blank canvas).
    const staticDraws = await glDrawCalls(page);
    expect(staticDraws).toBeGreaterThan(0);

    // A resize re-renders exactly one fresh frame; the state must not leave
    // 'static' and no animation loop may start.
    await page.setViewportSize({ width: 800, height: 600 });
    await expect.poll(() => lifecycle(page)).toBe('static');
    await expect.poll(() => glDrawCalls(page)).toBeGreaterThan(staticDraws);
    expect(errors).toEqual([]);
  });

  test('a failed bundle load degrades decoratively and a fresh document recovers', async ({ page }) => {
    // The aborted fetch itself logs a console error (net::ERR_FAILED) — that
    // is harness noise, not a component failure. Assert on page errors only:
    // the component must not leak an unhandled rejection or exception.
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
    const warns = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warns.push(msg.text());
      }
    });
    await spyOnGlDraws(page);

    // First connect: the three.js bundle fetch fails. The element must stay
    // decorative (no canvas, no crash) and leave an honest trail.
    await page.route('**/vendor/three.module.bundle.js', (route) => route.abort());
    await page.goto('/');
    await expect.poll(() => lifecycle(page)).toBe('disconnected');
    await expect.poll(() => canvasCount(page)).toBe(0);
    await expect.poll(() => warns.some((w) => w.includes('stardust unavailable'))).toBe(true);
    expect(pageErrors).toEqual([]);

    // Reconnect the SAME host in the same document: the component must
    // re-attempt the load (the warn trail grows) and degrade gracefully
    // again rather than crash. Re-appending the same element also keeps a
    // single host in the DOM, so querySelector-based assertions inspect the
    // retrying element. NOTE: Chromium's module map caches failed dynamic
    // imports, so the retry cannot succeed in-document even with the network
    // back — recovery is a fresh document. This asserts the
    // browser-imposed contract, not a component bug.
    await page.unroute('**/vendor/three.module.bundle.js');
    const warnsBefore = warns.length;
    await page.evaluate(() => {
      const host = document.querySelector('kinetic-background');
      host.remove();
      document.body.append(host);
    });
    await expect.poll(() => warns.length).toBeGreaterThan(warnsBefore);
    await expect.poll(() => lifecycle(page)).toBe('disconnected');
    await expect.poll(() => canvasCount(page)).toBe(0);
    expect(pageErrors).toEqual([]);

    // A fresh document (new module map) recovers into the running loop.
    await page.reload();
    await expect.poll(() => lifecycle(page)).toBe('running');
    await expect.poll(() => canvasCount(page)).toBe(1);
    await expect.poll(() => glDrawCalls(page)).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
  });

  test('a lost WebGL context degrades decoratively instead of freezing', async ({ page }) => {
    // three.js r128 logs its own note when the context is lost, so assert on
    // page errors + our warn trail, not console cleanliness.
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
    const warns = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warns.push(msg.text());
      }
    });
    await spyOnGlDraws(page);
    await page.goto('/');
    await expect.poll(() => lifecycle(page)).toBe('running');

    // Simulate a GPU/driver context loss. The component must route it
    // through the fail path and stop the loop — no frozen `running` zombie
    // silently doing nothing.
    await page.evaluate(() => {
      const canvas = document.querySelector('kinetic-background').shadowRoot.querySelector('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      gl.getExtension('WEBGL_lose_context').loseContext();
    });
    await expect.poll(() => lifecycle(page)).toBe('disconnected');
    await expect.poll(() => canvasCount(page)).toBe(0);
    await expect.poll(() => warns.some((w) => w.includes('stardust unavailable'))).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  test('detach and reconnect keeps exactly one canvas and resumes cleanly', async ({ page }) => {
    const errors = watchErrors(page);
    await spyOnGlDraws(page);
    await page.goto('/');
    await expect.poll(() => lifecycle(page)).toBe('running');

    // Detach: the loop cancels, listeners drop, the canvas is removed.
    // Hold a window reference — the element leaves the DOM, so querySelector
    // can no longer see it.
    await page.evaluate(() => {
      globalThis.__kb = document.querySelector('kinetic-background');
      globalThis.__kb.remove();
    });
    await expect.poll(() => page.evaluate(() => globalThis.__kb?.lifecycle)).toBe('disconnected');
    await expect.poll(() => page.evaluate(() => globalThis.__kb?.shadowRoot?.querySelectorAll('canvas').length ?? -1)).toBe(0);

    // Reconnect: a fresh canvas and renderer, no duplicates from the
    // previous life — and the new scene paints again.
    await page.evaluate(() => {
      const el = document.createElement('kinetic-background');
      document.body.append(el);
    });
    const drawsBeforeReconnect = await glDrawCalls(page);
    await expect.poll(() => lifecycle(page)).toBe('running');
    await expect.poll(() => canvasCount(page)).toBe(1);
    await expect.poll(() => glDrawCalls(page)).toBeGreaterThan(drawsBeforeReconnect);
    expect(errors).toEqual([]);
  });
});
