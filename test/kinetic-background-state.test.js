import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LifecycleState,
  MotionPreference,
  createParticlePositions,
  easedCamera,
  motionPreferenceFrom,
  nextLifecycleState,
  normalizedMouse,
  parseHexColor,
  starRotation,
} from '../components/kinetic-background-state.js';

describe('kinetic-background-state helpers', () => {
  describe('nextLifecycleState', () => {
    it('connect transitions only from Disconnected', () => {
      assert.equal(nextLifecycleState(LifecycleState.Disconnected, 'connect'), LifecycleState.Connecting);
      // idempotent — a second connect while connecting is a no-op
      assert.equal(nextLifecycleState(LifecycleState.Connecting, 'connect'), LifecycleState.Connecting);
      assert.equal(nextLifecycleState(LifecycleState.Running, 'connect'), LifecycleState.Running);
      assert.equal(nextLifecycleState(LifecycleState.Static, 'connect'), LifecycleState.Static);
    });

    it('ready requires Connecting and picks the state from motion', () => {
      assert.equal(nextLifecycleState(LifecycleState.Connecting, 'ready', MotionPreference.Full), LifecycleState.Running);
      assert.equal(nextLifecycleState(LifecycleState.Connecting, 'ready', MotionPreference.Reduced), LifecycleState.Static);
      // cannot be ready before connect, or twice
      assert.equal(nextLifecycleState(LifecycleState.Disconnected, 'ready'), LifecycleState.Disconnected);
      assert.equal(nextLifecycleState(LifecycleState.Running, 'ready'), LifecycleState.Running);
      assert.equal(nextLifecycleState(LifecycleState.Static, 'ready'), LifecycleState.Static);
    });

    it('disconnect and fail always land on Disconnected', () => {
      for (const state of Object.values(LifecycleState)) {
        assert.equal(nextLifecycleState(state, 'disconnect'), LifecycleState.Disconnected);
        assert.equal(nextLifecycleState(state, 'fail'), LifecycleState.Disconnected);
      }
    });

    it('unknown events leave the state unchanged', () => {
      assert.equal(nextLifecycleState(LifecycleState.Running, 'wobble'), LifecycleState.Running);
    });

    describe('motion-change (live preference flips)', () => {
      it('freezes a running element to static on a Reduce flip', () => {
        assert.equal(
          nextLifecycleState(LifecycleState.Running, 'motion-change', MotionPreference.Reduced),
          LifecycleState.Static
        );
      });

      it('restarts a static element to running on a full-motion flip', () => {
        assert.equal(
          nextLifecycleState(LifecycleState.Static, 'motion-change', MotionPreference.Full),
          LifecycleState.Running
        );
      });

      it('is a no-op in mismatched states or mismatched motion', () => {
        // No double-static, no running→running change, no crossing from
        // non-motion states.
        assert.equal(nextLifecycleState(LifecycleState.Running, 'motion-change', MotionPreference.Full), LifecycleState.Running);
        assert.equal(nextLifecycleState(LifecycleState.Static, 'motion-change', MotionPreference.Reduced), LifecycleState.Static);
        assert.equal(nextLifecycleState(LifecycleState.Connecting, 'motion-change', MotionPreference.Reduced), LifecycleState.Connecting);
        assert.equal(nextLifecycleState(LifecycleState.Disconnected, 'motion-change', MotionPreference.Reduced), LifecycleState.Disconnected);
        assert.equal(nextLifecycleState(LifecycleState.Failed ?? LifecycleState.Disconnected, 'motion-change', MotionPreference.Reduced), LifecycleState.Disconnected);
      });
    });
  });

  describe('motionPreferenceFrom', () => {
    it('reads the matches flag', () => {
      assert.equal(motionPreferenceFrom({ matches: true }), MotionPreference.Reduced);
      assert.equal(motionPreferenceFrom({ matches: false }), MotionPreference.Full);
    });

    it('defaults to full motion when matchMedia is unavailable', () => {
      assert.equal(motionPreferenceFrom(), MotionPreference.Full);
    });
  });

  describe('normalizedMouse', () => {
    it('maps the viewport center to the origin', () => {
      assert.deepEqual(normalizedMouse(640, 360, 1280, 720), { x: 0, y: 0 });
    });

    it('maps edges to ±1 with the y axis flipped', () => {
      assert.deepEqual(normalizedMouse(0, 0, 1280, 720), { x: -1, y: 1 });
      assert.deepEqual(normalizedMouse(1280, 720, 1280, 720), { x: 1, y: -1 });
    });

    it('stays finite on a zero-sized viewport', () => {
      const { x, y } = normalizedMouse(10, 20, 0, 0);
      assert.ok(Number.isFinite(x));
      assert.ok(Number.isFinite(y));
    });
  });

  describe('easedCamera', () => {
    it('factor 1 snaps to the target, factor 0 holds', () => {
      assert.equal(easedCamera(10, 20, 1), 20);
      assert.equal(easedCamera(10, 20, 0), 10);
    });

    it('factor 0.05 closes 5% of the gap', () => {
      assert.equal(easedCamera(10, 20, 0.05), 10.5);
      assert.equal(easedCamera(-10, -20, 0.05), -10.5);
    });
  });

  describe('starRotation', () => {
    it('is the documented drift rate', () => {
      assert.ok(Math.abs(starRotation(1000) - 0.02) < 1e-9);
    });

    it('completes a full turn in ≈5.2 minutes', () => {
    // period = 2π / (0.4 * 0.00005) ms ≈ 314.16 s — one turn returns to ~0
      const periodMs = (2 * Math.PI) / (0.4 * 0.00005);
      assert.ok(Math.abs(starRotation(periodMs) % (2 * Math.PI)) < 1e-6);
    });
  });

  describe('createParticlePositions', () => {
    it('produces count * 3 coordinates within the cube', () => {
      const positions = createParticlePositions(4, 1000);
      assert.equal(positions.length, 12);
      for (const value of positions) {
        assert.ok(value >= -500 && value < 500);
      }
    });

    it('honors an injected random source deterministically', () => {
      const allLow = createParticlePositions(2, 1000, () => 0);
      assert.deepEqual([...allLow], [-500, -500, -500, -500, -500, -500]);
      const allHigh = createParticlePositions(2, 1000, () => 1);
      assert.deepEqual([...allHigh], [500, 500, 500, 500, 500, 500]);
    });
  });

  describe('parseHexColor', () => {
    it('parses #RRGGBB in either case', () => {
      assert.equal(parseHexColor('#FF00A9'), 0xFF00A9);
      assert.equal(parseHexColor('#ff00a9'), 0xFF00A9);
      assert.equal(parseHexColor('FF00A9'), 0xFF00A9);
    });

    it('trims surrounding whitespace — load-bearing for the CSS token', () => {
      // `getPropertyValue('--pop-pink')` returns " #ff00a9" with leading
      // whitespace when the token is written `--pop-pink: #ff00a9;`.
      assert.equal(parseHexColor('  #FF00A9  '), 0xFF00A9);
      assert.equal(parseHexColor('\t#ff00a9\n'), 0xFF00A9);
    });

    it('rejects anything that is not a six-digit hex color', () => {
      assert.equal(parseHexColor('#fff'), null);
      assert.equal(parseHexColor('0xFF00A9'), null);
      assert.equal(parseHexColor('red'), null);
      assert.equal(parseHexColor('#12345g'), null);
      assert.equal(parseHexColor(''), null);
      assert.equal(parseHexColor(), null);
    });
  });
});
