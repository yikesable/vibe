# Phase D: Self-Host Google Fonts

> **Resolved (2026-08-28):** The RFN claim in this plan was **incorrect**.
> Primary-source verification — `rsms/inter` LICENSE.txt, `google/fonts`
> `ofl/inter/OFL.txt`, and the Inter name table (nameID 0/7/13) — confirmed
> Inter declares **no Reserved Font Name**; nameID 7 is a trademark notice
> only ("Inter UI and Inter is a trademark of rsms"). Inter is therefore
> subsetted and self-hosted under its own name. Full verification trail:
> `assets/fonts/LICENSE-fonts.md` → "Reserved Font Name verification — Inter".
> The "Option A (keep unmodified)" recommendation below was superseded by
> this finding.

## Research Findings

### License Audit (corrected)

| Font | License | RFN? | Source verified |
|------|---------|------|----------------|
| **Inter** (400/500/600/700/900) | SIL OFL 1.1 | ⚠️ **Yes** — "Inter" is a Reserved Font Name by Rasmus Andersson | github.com/rsms/inter |
| **Chakra Petch** (700) | SIL OFL 1.1 | No RFN found | github.com/cadsondemak/Chakra-Petch |
| **Special Elite** (400) | ⚠️ **Apache 2.0** (NOT OFL — current `LICENSE-fonts.md` is WRONG) | N/A (Apache has no RFN concept) | fonts.google.com, serbyte.net, 1001fonts.com all confirm Apache 2.0 |
| **Roboto Mono** (400/700) | Apache 2.0 | N/A | github.com/googlefonts/RobotoMono |
| **Oswald** (700) | SIL OFL 1.1 | No RFN found | github.com/googlefonts/OswaldFont, cyreal.org |
| **Roboto Condensed** (400/700) | Apache 2.0 | N/A | github.com/googlefonts/roboto |

### Key License Issue: Inter's Reserved Font Name

Inter declares "Inter" as a Reserved Font Name. Under OFL 1.1 §3:
> "No Modified Version of the Font Software may use the Reserved Font Name(s) [...] unless explicit written permission is granted."

**Subsetting = modification.** If we subset Inter and still call it `font-family: "Inter"` in CSS, that's technically an RFN violation. Two options:
- **Option A (safe):** Download the full, unmodified Inter variable font woff2 from rsms.me/inter or GitHub releases. No subsetting. Larger file (~340KB woff2 for the variable font with all glyphs) but legally clean.
- **Option B (pragmatic):** Use the Google Fonts CSS2 API woff2 (already Latin-subsetted by Google, ~100KB). Google has implicit/explicit permission from Rasmus to subset. We're just re-hosting Google's already-subsetted file, not creating a new modification ourselves. Legal gray area but widely done.

**Recommendation: Option A** — full variable font from canonical source. The size difference (~240KB) is acceptable for a site that already loads Three.js (145KB gzipped). Keeps us legally spotless.

### Inspiration: voxpelli/diarie `brand/fonts/`

The diarie project (at `../diarie/brand/fonts/`) is a clean reference:
- `.woff2` files only (no ttf/woff for web)
- Per-font license files (`Fraunces-OFL.txt`, `FragmentMono-OFL.txt`) fetched verbatim from upstream
- `README.md` with: file inventory table, provenance (designer + GitHub URL), "What was modified" section, "Outlined uses" section (OFL doc-embedding clause)
- `@font-face` embedded in HTML `<style>` with `font-display: swap`
- `<link rel="preload">` for critical fonts
- Both fonts verified as having **no Reserved Font Name** before subsetting with `pyftsubset`

Key difference from our case: diarie's fonts have no RFN, so they could freely subset. Inter's RFN means we either don't subset or we don't use the name "Inter".

### Font File Plan

| Font | File(s) | Format | Source | Size (est.) |
|------|---------|--------|--------|------------|
| Inter | `Inter-Variable.woff2` | Variable woff2 (wght 100–900) | rsms.me/inter or GitHub releases | ~340KB |
| Chakra Petch | `ChakraPetch-Bold.woff2` | Static woff2, weight 700 only | Google Fonts CSS2 API or Fontsource | ~20KB |
| Special Elite | `SpecialElite-Regular.woff2` | Static woff2, weight 400 only | Google Fonts CSS2 API or Fontsource | ~25KB |
| Roboto Mono | `RobotoMono-Regular.woff2`, `RobotoMono-Bold.woff2` | Static woff2, 400 + 700 | Google Fonts CSS2 API or Fontsource | ~20KB each |
| Oswald | `Oswald-Bold.woff2` | Static woff2, weight 700 only | Google Fonts CSS2 API or Fontsource | ~20KB |
| Roboto Condensed | `RobotoCondensed-Regular.woff2`, `RobotoCondensed-Bold.woff2` | Static woff2, 400 + 700 | Google Fonts CSS2 API or Fontsource | ~20KB each |

**Total estimated size: ~485KB** (Inter dominates at ~340KB; the other 7 files total ~145KB)

### Download Strategy

**Approach:** Download woff2 files directly from the Google Fonts CSS2 API for all fonts EXCEPT Inter. For Inter, download the full variable font woff2 from the canonical source (rsms.me/inter download page or GitHub releases).

The Google Fonts CSS2 API (`https://fonts.googleapis.com/css2?family=...`) returns `@font-face` CSS with `src: url(https://fonts.gstatic.com/...)` pointing to already-subsetted woff2 files. We fetch the CSS, extract the woff2 URLs, download the files. These are Latin-only subsets — sufficient for our English-content site.

For **Inter**: download from `https://rsms.me/inter/font-files/InterVariable.woff2` (the canonical variable font, unsubsetted). This keeps us legally clean re: RFN.

### License Files Plan

Following the diarie pattern — per-font license files fetched verbatim from upstream:

```
assets/fonts/
  Inter-Variable.woff2
  ChakraPetch-Bold.woff2
  SpecialElite-Regular.woff2
  RobotoMono-Regular.woff2
  RobotoMono-Bold.woff2
  Oswald-Bold.woff2
  RobotoCondensed-Regular.woff2
  RobotoCondensed-Bold.woff2
  LICENSE-fonts.md          ← updated with corrected licenses
  OFL-1.1.txt               ← full SIL OFL 1.1 text (for Inter, Chakra Petch, Oswald)
  Apache-2.0.txt            ← full Apache 2.0 text (for Special Elite, Roboto Mono, Roboto Condensed)
```

Note: We use a single shared `OFL-1.1.txt` and `Apache-2.0.txt` rather than per-font copies (unlike diarie). Rationale: all OFL fonts share the identical license text; the per-font copyright lines are documented in `LICENSE-fonts.md`. This is cleaner for 6 fonts across 2 licenses.

### CSS Plan

Create `assets/fonts/fonts.css` with all `@font-face` declarations:

```css
/* Inter — variable font, all weights 100–900 */
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("Inter-Variable.woff2") format("woff2");
}

/* Chakra Petch — Bold 700 */
@font-face {
  font-family: "Chakra Petch";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("ChakraPetch-Bold.woff2") format("woff2");
}

/* ... etc for each font ... */
```

### HTML Changes (5 files)

For each of the 5 HTML files (`index.html`, `stories/beyond-the-word-list.html`, `stories/manifesto.html`, `stories/jsdoc-types.html`, `codepen-converter/index.html`):

1. **Remove** the two Google Fonts `<link>` tags:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
   ```

2. **Add** local font CSS link + preload for critical fonts:
   ```html
   <link rel="preload" href="assets/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="stylesheet" href="assets/fonts/fonts.css">
   ```

   (Path adjusted per page depth — `../assets/fonts/fonts.css` for stories/ and codepen-converter/)

3. **Preload strategy**: Only preload Inter (the variable font, used on every page, largest file). The other fonts are small enough that `font-display: swap` handles them adequately.

### `LICENSE-fonts.md` Corrections

Three corrections needed:
1. **Special Elite**: Change license from "SIL Open Font License 1.1" → "Apache License 2.0". Update copyright: "Copyright © 2010 Brian J. Bonislawsky DBA Astigmatic"
2. **Inter**: Add note about Reserved Font Name: "Inter" is a RFN by Rasmus Andersson. We use the unmodified variable font without subsetting.
3. **General**: Add reference to the shared license files (`OFL-1.1.txt`, `Apache-2.0.txt`).

### README.md Update

Add a brief note in the README about self-hosted fonts:
- All fonts served locally from `assets/fonts/`
- No external font CDN requests
- License compliance via `LICENSE-fonts.md` + full license texts
- Inter variable font used unmodified (RFN compliance)

## Implementation Steps

1. **Download font files**
   - Inter: `curl -o assets/fonts/Inter-Variable.woff2 https://rsms.me/inter/font-files/InterVariable.woff2`
   - Others: Fetch Google Fonts CSS2 API, extract woff2 URLs, download each
   - Verify file sizes are reasonable (sanity check against known ranges)

2. **Download license files**
   - `OFL-1.1.txt`: from github.com/rsms/inter or openfontlicense.org
   - `Apache-2.0.txt`: from apache.org

3. **Create `assets/fonts/fonts.css`** with all `@font-face` declarations

4. **Update `assets/fonts/LICENSE-fonts.md`** with corrected license info

5. **Update 5 HTML files** — remove Google Fonts links, add local CSS + preload

6. **Update `README.md`** — add self-hosted fonts note

7. **Run quality checks** — `npm run lint:css`, `npm run fmt:check`, `npm run fmt`

8. **Browser QA** — verify all 5 pages render fonts correctly from local files

9. **Commit** — `feat: self-host all fonts, remove Google Fonts CDN dependency`

## Open Questions

1. **Inter variable font size**: ~340KB unsubsetted vs ~100KB Google-subsetted. Is the legal safety of the unmodified file worth the size? (Recommendation: yes)

2. **Subsetting Inter later**: If we want to subset Inter in the future, we'd need to either (a) get written permission from Rasmus Andersson, or (b) rename the font family in CSS to something other than "Inter". Not needed now but worth documenting.

3. **Oswald and Chakra Petch RFN status**: I could not find explicit confirmation that they have NO RFN. Need to verify by reading the actual OFL.txt files from their upstream repos during implementation. If they do have RFN, we'd need to use unmodified files for those too.