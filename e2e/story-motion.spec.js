import { expect, test } from '@playwright/test';

test.describe('story pages honor prefers-reduced-motion', () => {
  test('jsdoc-types: no slide auto-advance and full typewriter text under reduce', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/vibe/stories/jsdoc-types.html');

    // The first slide renders immediately.
    const activeSlide = page.locator('story-slide[active]');
    await expect(activeSlide).toHaveCount(1);

    // Typewriters complete instantly — the typed text equals the full
    // initialText (completion, not a partial frame of the animation).
    // Text lives in the shadow root → evaluate; scope to the ACTIVE slide —
    // manual-start typewriters on later slides haven't started.
    const typewriter = page.locator('story-slide[active] dos-typewriter').first();
    const { full, typed } = await typewriter.evaluate((el) => ({
      full: el.initialText,
      typed: el.shadowRoot.querySelector('.container').textContent,
    }));
    expect(full.length).toBeGreaterThan(0);
    expect(typed).toBe(full);
    // Prism highlighting must actually work — a silently-broken bundle
    // degrades to plain text (zero .token spans) with no other symptom.
    // The active slide's typewriter is plain text by design, so start a
    // highlighted one directly (start() completes instantly under reduce).
    const tokens = await page.locator('dos-typewriter[highlight]').first().evaluate((el) => {
      el.start();
      return el.shadowRoot.querySelectorAll('.container .token').length;
    });
    expect(tokens, 'syntax-highlighted token spans').toBeGreaterThan(0);

    // No auto-advance: well past the first slide's 8 s duration, the SAME
    // slide is still active (a control run without reduce advances).
    await page.waitForTimeout(9500);
    await expect(page.locator('story-slide[active]')).toHaveCount(1);
    const activeText = await activeSlide.evaluate((el) => el.textContent);
    expect(activeText).toContain('JSDoc');
    expect(pageErrors).toEqual([]);
  });

  test('jsdoc-types: slides auto-advance when motion is preferred (control)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/vibe/stories/jsdoc-types.html');
    const firstSlideText = await page.locator('story-slide[active]').evaluate((el) => el.textContent);
    // First slide's data-duration is 8 s — wait past it and expect progress.
    await page.waitForTimeout(9500);
    const laterSlideText = await page.locator('story-slide[active]').evaluate((el) => el.textContent);
    expect(laterSlideText).not.toBe(firstSlideText);
  });

  test('jsdoc-types: particle-field renders one static frame under reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/vibe/stories/jsdoc-types.html');
    const field = page.locator('particle-field');
    await expect(field).toHaveCount(1);
    // Static frame: a canvas exists with pixels drawn (WebGL preserveDrawing-
    // Buffer is off, so we assert the loop is NOT running instead — no rAF).
    const frameId = await field.evaluate((el) => el.animationFrameId);
    expect(frameId === null || frameId === undefined).toBe(true);
    // Live flip: switching to full motion starts the loop.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => field.evaluate((el) => el.animationFrameId), { timeout: 3000 }).not.toBeNull();
    // And back: the loop stops again (the field's sentinel is undefined).
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => field.evaluate((el) => el.animationFrameId), { timeout: 3000 }).toBeUndefined();
  });

  test('manifesto: no floating symbols under reduce, symbols under no-preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/vibe/stories/manifesto.html');
    await expect(page.locator('#floating-symbols-container li')).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/vibe/stories/manifesto.html');
    await expect(page.locator('#floating-symbols-container li')).toHaveCount(20);
  });

  test('manifesto: anchor navigation jumps without smooth scrolling under reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/vibe/stories/manifesto.html');
    // The skip link is the canary: activating it must move focus into main
    // (the page JS handles anchors itself and must not strand focus).
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const inMain = await page.evaluate(() =>
      document.activeElement?.closest('main') !== null || document.activeElement?.id === 'main-content'
    );
    expect(inMain).toBe(true);
  });

  test('manifesto: the symbol field syncs live with preference flips', async ({ page }) => {
    const symbols = page.locator('#floating-symbols-container li');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/vibe/stories/manifesto.html');
    await expect(symbols).toHaveCount(20);

    // Live flip to reduce: the existing glyphs are REMOVED, not frozen.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(symbols).toHaveCount(0);

    // A repeated reduce dispatch must not create anything.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(symbols).toHaveCount(0);

    // Flip back: exactly one fresh set — not zero, not doubled.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(symbols).toHaveCount(20);
  });

  test('jsdoc-types: a live Reduce flip completes the active typing instantly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/vibe/stories/jsdoc-types.html');
    // The active slide's typewriter is typing (no manual-start on slide 1).
    const typewriter = page.locator('story-slide[active] dos-typewriter').first();
    await expect.poll(() =>
      typewriter.evaluate((el) => el.shadowRoot.querySelector('.container').textContent.length)
    ).toBeGreaterThan(0);

    // Mid-typing Reduce: the FULL text must appear (not freeze mid-word),
    // proving the live change listener completes the animation.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const { full, typed } = await typewriter.evaluate((el) => ({
      typed: el.shadowRoot.querySelector('.container').textContent,
      full: el.initialText,
    }));
    expect(typed).toBe(full);
  });

  test('vp-pie-menu ships the standardized view-transition opt-in locally', async ({ page }) => {
    await page.goto('/vibe/component-explorations/vp-pie-menu.html');
    // The page loads no shared CSS, so the @view-transition rule must live
    // in its own <style> (the head meta alone is the legacy path).
    const hasRule = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText.startsWith('@view-transition')) return rule.cssText.includes('auto');
          }
        } catch { /* inaccessible sheets are skipped */ }
      }
      return false;
    });
    expect(hasRule, '@view-transition { navigation: auto } in vp-pie-menu styles').toBe(true);
    const name = await page.evaluate(() => getComputedStyle(document.querySelector('.hero-title')).viewTransitionName);
    expect(name).toBe('vt-pie-menu');
  });
});
