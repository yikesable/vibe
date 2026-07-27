# Font Licenses & Attribution

Font files in this directory are self-hosted copies obtained from each font's
canonical distribution point. Each font is used under its respective
open-source license. Full license texts are available alongside this file:

- **SIL OFL 1.1** → [`OFL-1.1.txt`](./OFL-1.1.txt) (Inter, Chakra Petch, Oswald)
- **Apache 2.0** → [`Apache-2.0.txt`](./Apache-2.0.txt) (Special Elite, Roboto Mono, Roboto Condensed)

---

## File Inventory

| File | Font | Weight(s) | Format | Size |
| --- | --- | --- | --- | --- |
| `Inter-Variable.woff2` | Inter | 100–900 (variable) | woff2 | ~344 KB |
| `ChakraPetch-Bold.woff2` | Chakra Petch | 700 (static) | woff2 | ~10 KB |
| `SpecialElite-Regular.woff2` | Special Elite | 400 (static) | woff2 | ~52 KB |
| `RobotoMono.woff2` | Roboto Mono | 100–700 (variable) | woff2 | ~32 KB |
| `Oswald-Bold.woff2` | Oswald | 700 (static) | woff2 | ~12 KB |
| `RobotoCondensed.woff2` | Roboto Condensed | 100–900 (variable) | woff2 | ~45 KB |

**Total: ~495 KB** (Inter dominates at ~344 KB; the other 5 files total ~151 KB)

---

## Per-Font Details

### Inter (Variable)

- **Designer**: Rasmus Andersson
- **Canonical source**: https://rsms.me/inter/ (GitHub: github.com/rsms/inter)
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)
- **What was modified**: Nothing. The canonical variable font woff2 is used
  unmodified from `https://rsms.me/inter/font-files/InterVariable.woff2`.
  The `@font-face` declaration maps the font's internal family name
  ("Inter Variable") to "Inter" in CSS for compatibility with the existing
  design system.
- **Reserved Font Name**: None declared. The font metadata (nameID=0
  copyright, nameID=13 license description) and the upstream LICENSE.txt do
  not specify a Reserved Font Name. The font's nameID=7 notes "Inter UI and
  Inter is a trademark of rsms" — this is a trademark notice, not an OFL
  Reserved Font Name.

### Chakra Petch

- **Designer**: Cadson Demak Design Team
- **Source**: https://fonts.google.com/specimen/Chakra+Petch
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2018 The Chakra Petch Project Authors (https://github.com/m4rc1e/Chakra-Petch.git)
- **What was modified**: Latin-only subset (via Google Fonts CSS2 API).
- **Reserved Font Name**: None declared in the upstream OFL.txt.

### Special Elite

- **Designer**: Astigmatic (Brian J. Bonislawsky)
- **Source**: https://fonts.google.com/specimen/Special-Elite
- **License**: Apache License 2.0 — see [`Apache-2.0.txt`](./Apache-2.0.txt)
- **Copyright**: Copyright (c) 2010 by Brian J. Bonislawsky DBA Astigmatic (AOETI). All rights reserved.
- **What was modified**: Latin-only subset (via Google Fonts CSS2 API).
- **Note**: This font is licensed under **Apache 2.0**, NOT the SIL OFL.
  The Apache 2.0 license has no Reserved Font Name concept.

### Roboto Mono

- **Designer**: Google
- **Source**: https://fonts.google.com/specimen/Roboto-Mono
- **License**: Apache License 2.0 — see [`Apache-2.0.txt`](./Apache-2.0.txt)
- **Copyright**: Copyright 2015 The Roboto Mono Project Authors (https://github.com/googlefonts/robotomono)
- **What was modified**: Latin-only subset (via Google Fonts CSS2 API).
- **Format**: Variable font (weight axis 100–700).

### Oswald

- **Designer**: Vernon Adams
- **Source**: https://fonts.google.com/specimen/Oswald
- **License**: SIL Open Font License 1.1 — see [`OFL-1.1.txt`](./OFL-1.1.txt)
- **Copyright**: Copyright 2016 The Oswald Project Authors (https://github.com/googlefonts/OswaldFont)
- **What was modified**: Latin-only subset (via Google Fonts CSS2 API).
- **Reserved Font Name**: None declared in the upstream OFL.txt.

### Roboto Condensed

- **Designer**: Christian Robertson (Google)
- **Source**: https://fonts.google.com/specimen/Roboto-Condensed
- **License**: Apache License 2.0 — see [`Apache-2.0.txt`](./Apache-2.0.txt)
- **Copyright**: Copyright 2011 Google Inc. All Rights Reserved.
- **What was modified**: Latin-only subset (via Google Fonts CSS2 API).
- **Format**: Variable font (weight axis 100–900).

---

## License Compliance Notes

### SIL OFL 1.1 fonts (Inter, Chakra Petch, Oswald)

The OFL requires that copies include the copyright notice and the license
text. By documenting each font's copyright above and providing the full OFL
1.1 text in [`OFL-1.1.txt`](./OFL-1.1.txt), the distribution requirements are
satisfied.

None of the three OFL fonts declare a Reserved Font Name in their upstream
license files or font metadata. This means subsetting and re-hosting under
the same family name is permitted without restriction under OFL §3.

### Apache 2.0 fonts (Special Elite, Roboto Mono, Roboto Condensed)

Apache 2.0 requires retention of the copyright notice and a copy of the
license. By documenting each font's copyright above and providing the full
Apache 2.0 text in [`Apache-2.0.txt`](./Apache-2.0.txt), the distribution
requirements are satisfied. Apache 2.0 has no Reserved Font Name concept.

### Subsetting

The Google Fonts CSS2 API serves Latin-only subsets of each font (except
Inter, which uses the unmodified canonical variable font). These subsets
are sufficient for the English-language content on this site.