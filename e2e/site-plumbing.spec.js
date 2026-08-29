import { expect, test } from '@playwright/test';

// Single source of truth for the public page universe: canonical URLs are
// derived (BASE + route), the sitemap expectation and the CDN sweep both
// iterate the same list. Keep in sync with sitemap.xml — the sitemap test
// below fails if the two drift apart.
const BASE = 'https://yikesable.github.io/vibe';

/** @type {Array<[route: string, ogType: string]>} — route '' is the index page. */
const PUBLIC_PAGES = [
  ['', 'website'],
  ['/stories/jsdoc-types.html', 'article'],
  ['/stories/beyond-the-word-list.html', 'article'],
  ['/stories/manifesto.html', 'article'],
  ['/codepen-converter/', 'website'],
  ['/component-explorations/vp-pie-menu.html', 'website'],
];

/** Derive the canonical URL for a route ('' → the site root). */
function canonicalFor (route) {
  return route === '' ? `${BASE}/` : `${BASE}${route}`;
}

// Known external debt: the converter loads Monaco from cdnjs (ROADMAP.md —
// slated for a vendored CodeMirror 6). Everything else must be same-origin.
const KNOWN_EXTERNAL_ORIGINS = new Set(['https://cdnjs.cloudflare.com']);

test.describe('site plumbing', () => {
  test('unknown routes serve the 404 page with a true 404 status', async ({ page }) => {
    const response = await page.goto('/missing-page');
    expect(response.status()).toBe(404);
    // Indexable error pages would end up in search results.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('h1')).toContainText("doesn't exist");
    await expect(page.locator('a', { hasText: 'Back to the collection' })).toHaveAttribute('href', '/vibe/');
    // A 404 must not pay the three.js fetch — no kinetic-background mount.
    await expect(page.locator('kinetic-background')).toHaveCount(0);
  });

  test('every public page carries canonical, og and favicon metadata', async ({ page }) => {
    for (const [route, ogType] of PUBLIC_PAGES) {
      await page.goto(`/vibe/${route}`);
      const canonical = canonicalFor(route);
      // Canonical and og:url must both carry the exact public URL.
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', ogType);
      // og:description is hand-authored per page — presence + non-empty.
      await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute('content', '');
      await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
      await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/vibe/assets/favicon.svg');
    }
  });

  test('every stylesheet and icon reference on every page resolves', async ({ page }) => {
    // The regression test for the absolute-path bug: a href that 404s never
    // shows up in DOM assertions — the page just renders unstyled.
    const routes = [...PUBLIC_PAGES.map(([route]) => `/vibe/${route}`), '/missing-page'];
    for (const route of routes) {
      await page.goto(route);
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('link[rel="stylesheet"], link[rel="icon"], script[src]')]
          .map((el) => el.getAttribute('href') ?? el.getAttribute('src'))
      );
      for (const href of hrefs) {
        // Absolute http(s) hrefs are external (Monaco's CDN debt) — covered
        // by the origin test, not resolvable from this server. Everything
        // else must resolve the way the browser would, against the PAGE url
        // (relative ../… hrefs on subpages).
        if (/^https?:\/\//.test(href)) continue;
        const res = await page.request.get(new URL(href, page.url()).pathname);
        expect(res.status(), `${route} → ${href}`).toBe(200);
        res.dispose();
      }
    }
  });

  test('no page loads assets from unknown origins', async ({ page }) => {
    // Stronger than a DOM scan: catches runtime-loaded assets too (the
    // require()'d Monaco editor on the converter page). Unknown-origin
    // requests fail this test; the documented Monaco debt is the allowlist.
    const external = new Set();
    page.on('request', (req) => {
      const origin = new URL(req.url()).origin;
      if (origin !== 'http://localhost:4173' && !KNOWN_EXTERNAL_ORIGINS.has(origin)) {
        external.add(origin);
      }
    });
    for (const [route] of PUBLIC_PAGES) {
      await page.goto(`/vibe/${route}`, { waitUntil: 'networkidle' });
    }
    expect([...external]).toEqual([]);
  });

  test('sitemap lists exactly the public pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(PUBLIC_PAGES.map(([route]) => canonicalFor(route)));
  });

  test('robots.txt allows all and names the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://yikesable.github.io/vibe/sitemap.xml');
  });

  test('the favicon asset exists', async ({ request }) => {
    const res = await request.get('/assets/favicon.svg');
    expect(res.status()).toBe(200);
  });
});
