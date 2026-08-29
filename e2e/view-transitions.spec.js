import { expect, test } from '@playwright/test';

// Cross-document view-transition morphs (Chromium/Safari only; other
// browsers navigate normally). Light-touch assertions: the wiring is
// verifiable (names on cards + targets), the animation itself is not.
const MORPH_PAIRS = [
  ['/vibe/codepen-converter/', 'vt-converter', 'h1.c-converter-hero__title'],
  ['/vibe/stories/jsdoc-types.html', 'vt-story-jsdoc', '.slide-title'],
  ['/vibe/stories/beyond-the-word-list.html', 'vt-story-word-list', 'h1.c-hero__title'],
  ['/vibe/stories/manifesto.html', 'vt-story-manifesto', 'h1.c-manifesto-hero__title'],
  ['/vibe/component-explorations/vp-pie-menu.html', 'vt-pie-menu', 'h1.hero-title'],
];

test.describe('view-transition morph wiring', () => {
  test('each index card and its target heading share one view-transition-name', async ({ page }) => {
    // Collect all card names on ONE index visit — navigating index↔target
    // per pair triggers real cross-document transitions mid-scan, which
    // freeze snapshots and make DOM reads racy.
    await page.goto('/vibe/');
    const sourceNames = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((el) => getComputedStyle(el).viewTransitionName)
        .filter((name) => name !== 'none')
    );
    for (const [, name] of MORPH_PAIRS) {
      expect(sourceNames.filter((n) => n === name).length, `index card for ${name}`).toBe(1);
    }

    for (const [route, name] of MORPH_PAIRS) {
      await page.goto(route);
      const target = await page.evaluate((n) =>
        [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName === n).length, name);
      expect(target, `morph target on ${route}`).toBe(1);
    }
  });

  test('navigation through a card still works when transitions are unsupported', async ({ page }) => {
    // Navigation is the contract; the transition is decoration.
    await page.goto('/vibe/');
    await page.click('a[href="./stories/beyond-the-word-list.html"]');
    await expect(page).toHaveURL(/beyond-the-word-list\.html$/);
    await expect(page.locator('h1')).toContainText('Word List');
  });

  test('the standardized @view-transition opt-in ships and reduced motion kills the animation', async ({ request }) => {
    const css = await (await request.get('/vibe/styles/vibe.css')).text();
    expect(css).toContain('@view-transition { navigation: auto; }');
    // The reduce block disables every view-transition pseudo-animation.
    expect(css).toContain('::view-transition-old(*)');
    expect(css).toContain('::view-transition-new(*)');
  });
});
