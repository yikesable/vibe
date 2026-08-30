import { expect, test } from '@playwright/test';

// The IIFE global three.js build (r160 removed the UMD build this page
// used to copy) — jsdoc-types.html is its only consumer via <particle-field>.
test.describe('the global three.js bundle on jsdoc-types', () => {
  test('exposes the THREE global and the particle field renders', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
    await page.goto('/vibe/stories/jsdoc-types.html');

    const three = await page.evaluate(() => Boolean(globalThis.THREE?.WebGLRenderer));
    expect(three, 'globalThis.THREE.WebGLRenderer from the IIFE bundle').toBe(true);

    // The story's <particle-field> initializes against the global.
    const field = page.locator('particle-field');
    await expect(field).toHaveCount(1);
    await expect.poll(() => field.evaluate((el) => Boolean(el.renderer)), { timeout: 5000 }).toBe(true);

    // The loop is live (or static under reduce — this context prefers motion).
    await expect.poll(() => field.evaluate((el) => el.animationFrameId), { timeout: 3000 }).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
  });
});
