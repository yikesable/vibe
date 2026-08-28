/**
 * Pure, DOM-free state helpers for `<kinetic-background>`.
 *
 * Everything in this module is deterministic given its inputs — no global,
 * no DOM, no Three.js — so the component's lifecycle rules and math are
 * unit-testable with `node --test`.
 */

/** The user's motion preference, resolved once at connect time. */
export const MotionPreference = Object.freeze({
  /** `prefers-reduced-motion: reduce` — render a static frame, never animate. */
  Reduced: 'reduced',
  /** Default — run the animation loop. */
  Full: 'full',
});

/**
 * Component lifecycle states.
 *
 * `Disconnected → Connecting → (Running | Static) → Disconnected`.
 * `Connecting` covers the async Three.js load; `fail` and `disconnect` are
 * the only events that may leave it.
 */
export const LifecycleState = Object.freeze({
  Disconnected: 'disconnected',
  Connecting: 'connecting',
  /** Animation loop running (full motion). */
  Running: 'running',
  /** One rendered frame, no loop, no pointer response (reduced motion). */
  Static: 'static',
});

/**
 * Lifecycle reducer — pure, so connect/disconnect idempotency and the
 * reduced-motion branch are testable without a browser.
 *
 * Events:
 * - `connect` — element attached; only transitions from `Disconnected`.
 * - `ready` — async initialization finished; requires `Connecting` and picks
 *   `Running` or `Static` from the motion preference.
 * - `disconnect` — element detached; always returns `Disconnected`.
 * - `fail` — initialization threw (WebGL unavailable, bundle load failed);
 *   always returns `Disconnected` so a later connect retries.
 *
 * @param {string} current — the current `LifecycleState`.
 * @param {'connect'|'ready'|'disconnect'|'fail'} event
 * @param {string} [motion] — a `MotionPreference` value, used by `ready`.
 * @returns {string} the next `LifecycleState`.
 */
export function nextLifecycleState (current, event, motion = MotionPreference.Full) {
  switch (event) {
    case 'connect':
      return current === LifecycleState.Disconnected ? LifecycleState.Connecting : current;
    case 'ready':
      return current === LifecycleState.Connecting
        ? (motion === MotionPreference.Reduced ? LifecycleState.Static : LifecycleState.Running)
        : current;
    case 'disconnect':
    case 'fail':
      return LifecycleState.Disconnected;
    default:
      return current;
  }
}

/**
 * Resolve the motion preference from a MediaQueryList. Unavailable APIs
 * (no `matchMedia`) default to full motion — never crash on capability.
 *
 * @param {{ matches: boolean } | undefined} mediaQueryList
 * @returns {string} a `MotionPreference` value.
 */
export function motionPreferenceFrom (mediaQueryList) {
  return mediaQueryList?.matches ? MotionPreference.Reduced : MotionPreference.Full;
}

/**
 * Map a pointer event to normalized device coordinates (NDC).
 * Guards against a zero-sized viewport so the result is always finite.
 *
 * @param {number} clientX
 * @param {number} clientY
 * @param {number} width — viewport width.
 * @param {number} height — viewport height.
 * @returns {{ x: number, y: number }} both in [-1, 1].
 */
export function normalizedMouse (clientX, clientY, width, height) {
  const w = width > 0 ? width : 1;
  const h = height > 0 ? height : 1;
  return {
    x: (clientX / w) * 2 - 1,
    y: -(clientY / h) * 2 + 1,
  };
}

/**
 * Ease a camera coordinate toward a target — the parallax lag.
 *
 * @param {number} current
 * @param {number} target
 * @param {number} factor — easing factor in (0, 1]; 0 keeps `current`.
 * @returns {number}
 */
export function easedCamera (current, target, factor) {
  return current + (target - current) * factor;
}

/**
 * Cloud rotation phase for a timestamp. `0.4 * 0.00005` radians per
 * millisecond ≈ one full turn every 5.2 minutes (DESIGN.md: the drift is
 * meant to read as ambient, not motion).
 *
 * @param {number} now — epoch or `performance.now()` milliseconds.
 * @returns {number} radians.
 */
export function starRotation (now) {
  return now * 0.00005 * 0.4;
}

/**
 * Positions for the particle cloud: `count` points uniformly in a cube of
 * side `spread` centered on the origin. The random source is injectable so
 * tests can pin the output.
 *
 * @param {number} count
 * @param {number} spread — cube side length.
 * @param {() => number} [random] — uniform [0, 1); defaults to `Math.random`.
 * @returns {Float32Array} length `count * 3`.
 */
export function createParticlePositions (count, spread, random = Math.random) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < positions.length; i++) {
    positions[i] = (random() - 0.5) * spread;
  }
  return positions;
}

/**
 * Parse a `#RRGGBB` hex color to a number Three.js accepts. `null` for
 * anything else, so callers can fall through to the next source.
 *
 * @param {string | undefined} value
 * @returns {number | null}
 */
export function parseHexColor (value) {
  if (typeof value !== 'string') {
    return null;
  }
  const hex = value.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return null;
  }
  return Number.parseInt(hex, 16);
}
