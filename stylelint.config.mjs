// @ts-check

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],

  rules: {
    // ── Allow BEM naming (c-bento__item--wide, u-text-center, o-grid--md-2) ──
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$',
      {
        message: 'Expected class selector to be BEM or kebab-case',
      },
    ],

    // ── Allow compact single-line blocks (up to 4 declarations per line) ──
    'declaration-block-single-line-max-declarations': 4,

    // ── We use `min-width:` / `max-width:` media query syntax (not range) ──
    'media-feature-range-notation': null,

    // ── We use `rgba()` and decimal alpha — no forced migration to `rgb()` ──
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    'color-function-notation': null,

    // ── Vendor prefixes like -webkit- are intentional (e.g. text-size-adjust) ──
    'property-no-vendor-prefix': null,

    // ── Font names with quotes are valid and clearer ──
    'font-family-name-quotes': null,

    // ── Our comment style is deliberate (section headers with dashes) ──
    'comment-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,

    // ── False positives with @layer specificity ordering ──
    'no-descending-specificity': null,

    // ── Custom properties are kebab-case ──
    'custom-property-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
      { message: 'Expected custom property to be kebab-case' },
    ],

    // ── Keyframe names (pulse-border, slide-from-right) ──
    'keyframes-name-pattern': [
      '^[a-z][a-zA-Z0-9-]+$',
      { message: 'Expected keyframe name to be kebab-case' },
    ],

    // ── No @import used in this project ──
    'import-notation': null,
  },
};