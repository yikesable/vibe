# Font Licenses & Attribution

Font files in this directory are self-hosted copies, downloaded from each
font's canonical upstream source and subsetted to the Latin unicode range
using the `subset-font` npm package (harfbuzzjs/WASM). Full license texts are
available alongside this file:

- **SIL OFL 1.1** → [`OFL-1.1.txt`](./OFL-1.1.txt) (Inter, Chakra Petch, Oswald, Roboto Mono, Roboto Condensed)
- **Apache 2.0** → [`Apache-2.0.txt`](./Apache-2.0.txt) (Special Elite)

The entire download and subsetting process is automated by
[`scripts/download-fonts.mjs`](../../scripts/download-fonts.mjs). See the
"Reproducibility" section below.

---

## File Inventory

| File | Font | Weight(s) | Format | Size |
| --- | --- | --- | --- | --- |
| `Inter-Variable.woff2` | Inter | 100–900 (variable) | woff2 | ~103 KB |
| `ChakraPetch-Bold.woff2` | Chakra Petch | 700 (static) | woff2 | ~16 KB |
| `SpecialElite-Regular.woff2` | Special Elite | 400 (static) | woff2 | ~52 KB |
| `RobotoMono.woff2` | Roboto Mono | 100–700 (variable) | woff2 | ~37 KB |
| `Oswald-Bold.woff2` | Oswald | 200–700 (variable) | woff2 | ~28 KB |
| `RobotoCondensed.woff2` | Roboto Condensed | 100–900 (variable) | woff2 | ~66 KB |

**Total: ~301 KB**

---

## Per-Font Details

### Inter (Variable)

- **Designer**: Rasmus Andersson
- **Upstream source**: https://github.com/rsms/inter
- **Binary downloaded from**: https://rsms.me/inter/font-files/InterVariable.woff2 (creator's binary distribution)
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)
- **What was modified**: Subsetted to the Latin unicode range. The full
  variable font (344 KB) is reduced to ~103 KB — a 70% reduction. Both
  variable font axes (opsz 14–32, wght 100–900) and all 9 named instances
  are preserved.
- **Reserved Font Name**: None declared. The font metadata and upstream
  LICENSE.txt do not specify a Reserved Font Name. The font's nameID=7
  notes "Inter UI and Inter is a trademark of rsms" — this is a trademark
  notice, not an OFL Reserved Font Name.

### Chakra Petch

- **Designer**: Cadson Demak Design Team
- **Upstream source**: https://github.com/m4rc1e/Chakra-Petch
- **Binary downloaded from**: Creator's repo (built TTFs in `fonts/` directory)
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2018 The Chakra Petch Project Authors (https://github.com/m4rc1e/Chakra-Petch)
- **What was modified**: Subsetted to the Latin unicode range (131 KB → ~16 KB).
- **Reserved Font Name**: None declared in the upstream OFL.txt.

### Special Elite

- **Designer**: Astigmatic (Brian J. Bonislawsky)
- **Upstream source**: https://github.com/googlefonts/googlefontdirectory-hg (legacy)
- **Binary downloaded from**: google/fonts binary distribution (`apache/specialelite/`)
- **License**: Apache License 2.0 — see [`Apache-2.0.txt`](./Apache-2.0.txt)
- **Copyright**: Copyright (c) 2010 by Brian J. Bonislawsky DBA Astigmatic (AOETI). All rights reserved.
- **What was modified**: Subsetted to the Latin unicode range (162 KB → ~52 KB).
- **Note**: This font is licensed under **Apache 2.0**, NOT the SIL OFL.
  The Apache 2.0 license has no Reserved Font Name concept.

### Roboto Mono

- **Designer**: Christian Robertson (Google)
- **Upstream source**: https://github.com/googlefonts/RobotoMono
- **Binary downloaded from**: google/fonts binary distribution (`ofl/robotomono/`)
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2015 The Roboto Mono Project Authors (https://github.com/googlefonts/robotomono)
- **What was modified**: Subsetted to the Latin unicode range (179 KB → ~37 KB).
  Variable font weight axis (100–700) preserved.
- **Note**: Previously licensed under Apache 2.0; re-licensed to OFL in
  the google/fonts catalog (Feb 2026).

### Oswald

- **Designer**: Vernon Adams (maintained by Kalapi Gajjar / Cyreal)
- **Upstream source**: https://github.com/googlefonts/OswaldFont (archived)
- **Binary downloaded from**: google/fonts binary distribution (`ofl/oswald/`)
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2016 The Oswald Project Authors (https://github.com/googlefonts/OswaldFont)
- **What was modified**: Subsetted to the Latin unicode range (168 KB → ~28 KB).
  Variable font weight axis (200–700) preserved.
- **Reserved Font Name**: None declared in the upstream OFL.txt.

### Roboto Condensed

- **Designer**: Christian Robertson (Google)
- **Upstream source**: https://github.com/googlefonts/roboto-3-classic
- **Binary downloaded from**: google/fonts binary distribution (`ofl/robotocondensed/`)
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2011 The Roboto Project Authors (https://github.com/googlefonts/roboto-classic)
- **What was modified**: Subsetted to the Latin unicode range (363 KB → ~66 KB).
  Variable font weight axis (100–900) preserved.
- **Note**: Previously licensed under Apache 2.0; re-licensed to OFL in
  the google/fonts catalog.

---

## License Compliance Notes

### SIL OFL 1.1 fonts (Inter, Chakra Petch, Oswald, Roboto Mono, Roboto Condensed)

The OFL requires that copies include the copyright notice and the license
text. By documenting each font's copyright above and providing the full OFL
1.1 text in [`OFL-1.1.txt`](./OFL-1.1.txt), the distribution requirements are
satisfied.

None of the five OFL fonts declare a Reserved Font Name in their upstream
license files or font metadata. This means subsetting and re-hosting under
the same family name is permitted without restriction under OFL §3.
See the dedicated verification below for Inter — the font this question
has historically been raised about.

#### Reserved Font Name verification — Inter

This question has been raised repeatedly during the history of this
project — first as an unverified *claim* in `.rpiv/plans/self-host-fonts.md`
that "Inter" is a Reserved Font Name, and again whenever the fonts are
touched. Every check against primary sources returns the same result:
**Inter declares no Reserved Font Name.** Verification trail (last
re-verified 2026-08-28):

1. **`rsms/inter` LICENSE.txt** (the creator's repo, `master` branch —
   <https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt>).
   OFL 1.1 defines a Reserved Font Name as "any names specified as such
   after the copyright statement(s)". The copyright line reads *"Copyright
   (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)"* —
   no "with Reserved Font Name …" clause follows it.

2. **`google/fonts` `ofl/inter/OFL.txt`** (the canonical binary
   distribution —
   <https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt>).
   Copyright line *"Copyright 2020 The Inter Project Authors"* — same
   result. Google Fonts itself ships a subsetted Inter under the name
   "Inter", reflecting the industry reading of OFL §3.

3. **Inter's own name table** (`InterVariable.ttf`, nameID fields decoded
   as UTF-16BE):
   - nameID 0 (copyright): *"Copyright 2016 The Inter Project Authors"* —
     no reserved-name clause.
   - nameID 7 (trademark): *"Inter UI and Inter is a trademark of rsms"* —
     a **trademark notice, not an OFL Reserved Font Name**. It restricts
     using the name to *promote a product*, not naming a modified font file
     (the same distinction Google Fonts relies on).
   - nameID 13 (license description): SIL Open Font License 1.1.

**Conclusion:** Subsetting Inter and re-hosting it under the family name
"Inter" is permitted under OFL §3 — the restriction applies only to
Reserved Font Names, and none is declared. Caveats: (a) the trademark
notice means "Inter" must not be used to promote or endorse products —
the attribution in this file preserves that; (b) if upstream ever adds a
Reserved Font Name clause, the `@font-face` family name must change before
the next re-subset; re-run the three checks above when updating Inter.

### Apache 2.0 fonts (Special Elite)

Apache 2.0 requires retention of the copyright notice and a copy of the
license. By documenting the font's copyright above and providing the full
Apache 2.0 text in [`Apache-2.0.txt`](./Apache-2.0.txt), the distribution
requirements are satisfied. Apache 2.0 has no Reserved Font Name concept.

### Subsetting

All fonts are downloaded from their canonical upstream source as original
(un-subsetted) TTF or woff2 files, then subsetted to the Google Fonts
"latin" unicode range using the `subset-font` npm package (harfbuzzjs/WASM).
Variable font axes are preserved during subsetting.

The Latin unicode-range covers basic Latin, Latin-1 Supplement, common
punctuation, currency symbols, and a few presentation forms — sufficient
for English-language content.

### Reproducibility

The entire download and subsetting process is automated by
[`scripts/download-fonts.mjs`](../../scripts/download-fonts.mjs). Run:

```sh
node scripts/download-fonts.mjs
```

The script downloads all font files from their upstream sources, subsets
them to Latin, and downloads license texts. It prints a summary of file
sizes. The process is deterministic given the same upstream font versions.

For fonts whose upstream repos only contain source files (not built TTFs),
the script downloads from the `github.com/google/fonts` repository, which
is the canonical binary distribution built from those exact upstream sources.
Each font's upstream source repo is documented in the per-font details above
and in the script itself.