// Minimal static file server for Playwright e2e tests — serves the repo root.
// node:http only; no dependencies. Run via playwright.config.js webServer.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number.parseInt(process.env.PORT ?? '4173', 10);

// Precomputed at startup: a missing 404.html becomes a loud boot-time crash
// (correct for a test server) instead of a silent per-request fallback.
const notFoundBody = await readFile(path.join(root, '404.html'));

// The production site lives under the /vibe/ subpath on GitHub Pages; the
// e2e server mirrors that by accepting both the bare root and /vibe/-
// prefixed URLs, so absolute /vibe/… asset paths (used by 404.html, which
// Pages serves at ANY depth) resolve identically here and in production.

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    // Strip query strings; map "/" and directory paths to index.html.
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/vibe' || pathname === '/vibe/') {
      pathname = '/';
    } else if (pathname.startsWith('/vibe/')) {
      pathname = pathname.slice('/vibe'.length);
    }
    if (pathname === '/' || pathname.endsWith('/')) {
      pathname += 'index.html';
    }
    const filePath = path.resolve(root, `.${pathname}`);
    // Refuse to serve anything outside the repo root.
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const body = await readFile(filePath);
    const mime = MIME[path.extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'content-type': mime });
    res.end(body);
  } catch (err) {
    // Error classes are kept distinct: ENOENT is a client miss (404 page,
    // matching GitHub Pages' documented custom-404 behavior — the e2e
    // verifies THIS server, not production Pages), a malformed path is a
    // client error (400), and anything else is a server defect that must
    // NOT wear a friendly 404 face (500, loudly logged).
    const status = err?.code === 'ENOENT' ? 404 : (err instanceof URIError ? 400 : 500);
    if (status !== 404) {
      console.error(`e2e server: ${req.method ?? 'GET'} ${req.url ?? '/'} → ${status} (${err instanceof Error ? err.message : String(err)})`);
    }
    if (req.method === 'HEAD') {
      res.writeHead(status).end();
      return;
    }
    res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' });
    res.end(status === 404 ? notFoundBody : 'Error');
  }
}).listen(port, () => {
  console.log(`e2e server on http://localhost:${port}`);
});
