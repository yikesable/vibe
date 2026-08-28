/**
 * Download and subset web fonts for self-hosting.
 *
 * This script is the single source of truth for how the font files in
 * 'assets/fonts/' are produced. Run it whenever a font needs to be updated
 * or re-subsetted:
 *
 *   node scripts/download-fonts.mjs
 *
 * What it does:
 *   1. Downloads the original (un-subsetted) font files from each font's
 *      canonical upstream source — the creator's own repo/website where
 *      available, otherwise from the google/fonts binary distribution repo
 *      (github.com/google/fonts), which is the canonical binary distribution
 *      built from those upstream sources.
 *   2. Subsets every font to the Google Fonts "latin" unicode range using
 *      the 'subset-font' npm package (harfbuzzjs/WASM — no Python required).
 *      Variable font axes are preserved.
 *   3. Downloads the full OFL 1.1 and Apache 2.0 license texts.
 *
 * The Latin unicode-range used for subsetting:
 *   U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
 *   U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
 *   U+2212, U+2215, U+FEFF, U+FFFD
 *
 * This covers basic Latin, Latin-1 Supplement, common punctuation, currency
 * symbols, and a few presentation forms — sufficient for English-language
 * content.
 *
 * Upstream sources (from google/fonts upstream_info.md files):
 *   Inter             → github.com/rsms/inter (rsms.me/inter binary)
 *   Chakra Petch      → github.com/m4rc1e/Chakra-Petch (Marc Foley's fork)
 *   Special Elite     → github.com/googlefonts/googlefontdirectory-hg (legacy, proprietary source)
 *   Oswald            → github.com/googlefonts/OswaldFont
 *   Roboto Mono       → github.com/googlefonts/RobotoMono
 *   Roboto Condensed   → github.com/googlefonts/roboto-3-classic (renamed from roboto-classic)
 *
 * For fonts whose upstream repos only contain source files (not built TTFs),
 * we download from the google/fonts repo which is the canonical binary
 * distribution built from those exact upstream sources.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');

// Google Fonts "latin" subset unicode-range
const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, ' +
  'U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, ' +
  'U+2212, U+2215, U+FEFF, U+FFFD';

const UA = 'Mozilla/5.0';

/**
 * Font download configuration.
 *
 * sourceUrl: Direct URL to the original (un-subsetted) font file.
 *   - Creator repos with built TTFs: raw.githubusercontent.com/creator/repo/...
 *   - google/fonts binary distribution: raw.githubusercontent.com/google/fonts/...
 *   - Inter: rsms.me/inter provides a built woff2 directly
 *
 * upstreamRepo: The canonical upstream source repo (from google/fonts
 *   upstream_info.md). Documented in LICENSE-fonts.md even when the binary
 *   is downloaded from google/fonts.
 */
const FONTS = [
  {
    name: 'Inter',
    sourceUrl: 'https://rsms.me/inter/font-files/InterVariable.woff2',
    outputFile: 'Inter-Variable.woff2',
    upstreamRepo: 'https://github.com/rsms/inter',
    note: "Creator's binary distribution (rsms.me/inter)",
  },
  {
    name: 'Chakra Petch',
    sourceUrl:
      'https://raw.githubusercontent.com/m4rc1e/Chakra-Petch/master/fonts/ChakraPetch-Bold.ttf',
    outputFile: 'ChakraPetch-Bold.woff2',
    upstreamRepo: 'https://github.com/m4rc1e/Chakra-Petch',
    note: "Creator's repo (built TTFs in fonts/)",
  },
  {
    name: 'Special Elite',
    sourceUrl:
      'https://raw.githubusercontent.com/google/fonts/main/apache/specialelite/SpecialElite-Regular.ttf',
    outputFile: 'SpecialElite-Regular.woff2',
    upstreamRepo: 'https://github.com/googlefonts/googlefontdirectory-hg',
    note: 'google/fonts binary (upstream is legacy repo)',
  },
  {
    name: 'Oswald',
    sourceUrl:
      'https://raw.githubusercontent.com/googlefonts/OswaldFont/main/fonts/variable/Oswald%5Bwght%5D.ttf',
    outputFile: 'Oswald-Bold.woff2',
    upstreamRepo: 'https://github.com/googlefonts/OswaldFont',
    note: 'Upstream repo (built TTFs in fonts/variable/)',
  },
  {
    name: 'Roboto Mono',
    sourceUrl:
      'https://raw.githubusercontent.com/google/fonts/main/ofl/robotomono/RobotoMono%5Bwght%5D.ttf',
    outputFile: 'RobotoMono.woff2',
    upstreamRepo: 'https://github.com/googlefonts/RobotoMono',
    note: 'google/fonts binary (upstream has source only, no built TTFs)',
  },
  {
    name: 'Roboto Condensed',
    sourceUrl:
      'https://raw.githubusercontent.com/google/fonts/main/ofl/robotocondensed/RobotoCondensed%5Bwght%5D.ttf',
    outputFile: 'RobotoCondensed.woff2',
    upstreamRepo: 'https://github.com/googlefonts/roboto-3-classic',
    note: 'google/fonts binary (upstream has source only)',
  },
];

const LICENSE_FILES = [
  {
    url: 'https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt',
    outputFile: 'OFL-1.1.txt',
  },
  {
    url: 'https://www.apache.org/licenses/LICENSE-2.0.txt',
    outputFile: 'Apache-2.0.txt',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

async function fetchBuffer (url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText (url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/**
 * Convert a unicode-range string to a string of characters for subset-font.
 *
 * @param rangeStr
 */
function unicodeRangeToString (rangeStr) {
  const parts = rangeStr.split(',').map((s) => s.trim().replace(/^U\+/, ''));
  let result = '';
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((h) => Number.parseInt(h, 16));
      for (let i = start; i <= end; i++) {
        result += String.fromCodePoint(i);
      }
    } else if (part.includes('?')) {
      const base = part.replaceAll('?', '0');
      const top = part.replaceAll('?', 'F');
      const start = Number.parseInt(base, 16);
      const end = Number.parseInt(top, 16);
      for (let i = start; i <= end; i++) {
        result += String.fromCodePoint(i);
      }
    } else {
      result += String.fromCodePoint(Number.parseInt(part, 16));
    }
  }
  return result;
}

function formatBytes (bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main () {
  console.log('Ensuring output directory exists...');
  // recursive mkdir is idempotent — no existsSync needed
  await mkdir(FONTS_DIR, { recursive: true });

  const latinChars = unicodeRangeToString(LATIN_RANGE);
  const results = [];

  // ── 1. Download and subset all fonts ──
  for (const font of FONTS) {
    console.log(`\n── ${font.name} ──`);
    console.log(`  Source: ${font.sourceUrl}`);
    console.log(`  Upstream: ${font.upstreamRepo}`);
    console.log(`  (${font.note})`);

    const original = await fetchBuffer(font.sourceUrl);
    console.log(`  Original: ${formatBytes(original.length)}`);

    console.log('  Subsetting to Latin...');
    const subset = await subsetFont(original, latinChars, {
      targetFormat: 'woff2',
    });

    const outputPath = path.join(FONTS_DIR, font.outputFile);
    await writeFile(outputPath, subset);
    const reduction = ((1 - subset.length / original.length) * 100).toFixed(0);
    console.log(`  → ${font.outputFile}: ${formatBytes(subset.length)} (${reduction}% smaller)`);
    results.push({ file: font.outputFile, size: subset.length });
  }

  // ── 2. License files ──
  console.log('\n── License files ──');
  for (const lic of LICENSE_FILES) {
    console.log(`  ${lic.outputFile}: downloading from ${lic.url}`);
    const data = await fetchText(lic.url);
    const outputPath = path.join(FONTS_DIR, lic.outputFile);
    await writeFile(outputPath, data, 'utf8');
    console.log(`    → ${lic.outputFile}: ${formatBytes(Buffer.byteLength(data))}`);
  }

  // ── Summary ──
  console.log('\n── Summary ──');
  const total = results.reduce((sum, r) => sum + r.size, 0);
  for (const r of results) {
    console.log(`  ${r.file}: ${formatBytes(r.size)}`);
  }
  console.log(`  ${'─'.repeat(40)}`);
  console.log(`  Total font payload: ${formatBytes(total)}`);
  console.log('\n✓ All fonts downloaded and subsetted successfully.');
}

try {
  await main();
} catch (err) {
  console.error('✗ Error:', err.message);
  // CLI exit path — a thrown error here would lose the exit code.
  process.exitCode = 1;
}
