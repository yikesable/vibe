// HUG Principle: Guided - Three.js is loaded lazily from the local vendor
// copy (built from node_modules via npm run build:vendor): the ~600 KB
// bundle is fetched only when a <kinetic-background> element connects, not
// eagerly at page load. Both motion modes render through WebGL (the
// reduced-motion path draws one static frame), so the lazy load applies
// equally to them.
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
} from './kinetic-background-state.js';

const PARTICLE_COUNT = 2000;
const SPREAD = 1000; // cube side length, centered on the origin
const CAMERA_Z = 400;
const MOUSE_SWAY = 50;
const EASE_FACTOR = 0.05; // parallax lag ≈ a third of a second
const MAX_PIXEL_RATIO = 2; // cap for crisp specks on Retina without GPU burn
const FALLBACK_COLOR = 0xFF00A9; // design token --pop-pink, demoted to fallback

/** Lazily cached module promise — reconnects reuse the loaded bundle. */
let threeModulePromise;

function loadThree () {
  if (threeModulePromise === undefined) {
    // Clear the cache on rejection so a later connect re-attempts the fetch:
    // a transient network blip must not disable the decorative layer for the
    // whole page lifetime. (The browser's module map may itself cache the
    // failed import within the document — recovery then awaits a fresh
    // navigation, which serves a fresh module map.)
    threeModulePromise = (async () => {
      try {
        return await import('../vendor/three.module.bundle.js');
      } catch (err) {
        threeModulePromise = undefined;
        throw err;
      }
    })();
  }
  return threeModulePromise;
}

/**
 * @class KineticBackground
 * A self-contained Web Component that creates a kinetic, mouse-interactive
 * particle background — the site's stardust depth layer.
 *
 * HUG Principle: Humane & Usable
 * - Decorative by design: the host and canvas are `aria-hidden`.
 * - Owns its lifecycle: idempotent connect/disconnect, generation-token
 *   guarded async initialization, listeners removed and Three.js resources
 *   disposed on detach.
 * - Respects motion preferences: under `prefers-reduced-motion` one static
 *   frame is rendered (the depth layer stays) but nothing animates and the
 *   pointer does nothing; a resize re-renders a single fresh frame.
 * - Failures keep the element decorative: no unhandled rejection, and a
 *   missing WebGL context or failed bundle load surfaces as a console note
 *   rather than a blank-page crash.
 */
class KineticBackground extends HTMLElement {
  constructor () {
    super();
    // Encapsulate the component's styles and markup.
    this.attachShadow({ mode: 'open' });
    this.lifecycle = LifecycleState.Disconnected;
    this.generation = 0; // bumped on connect and disconnect to orphan async work
    this.animationFrameId = undefined;
    this.canvas = undefined;
    this.renderer = undefined;
    this.geometry = undefined;
    this.material = undefined;
    this.onWindowResize = undefined;
    this.onDocumentMouseMove = undefined;
  }

  // Called when the element is added to the page's DOM.
  connectedCallback () {
    // The spec may call this again on an already-connected element.
    if (this.lifecycle !== LifecycleState.Disconnected) {
      return;
    }
    this.lifecycle = nextLifecycleState(this.lifecycle, 'connect');
    const generation = ++this.generation;

    // The stardust is background decoration, not content. Set here, not in
    // the constructor: the custom-elements spec forbids adding attributes
    // during construction (createElement throws otherwise).
    this.setAttribute('aria-hidden', 'true');

    // Set up the component's base styles.
    this.style.position = 'fixed';
    this.style.top = '0';
    this.style.left = '0';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.zIndex = '0';
    this.style.pointerEvents = 'none';

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    this.canvas = canvas;
    this.shadowRoot.append(canvas);

    this.motion = motionPreferenceFrom(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)'));
    // Asynchronous: the Three.js bundle loads lazily. The generation token
    // guards against the element detaching (or reconnecting) mid-load.
    // initThree never rejects — failures are handled inside — so the plain
    // call is safe.
    this.initThree(generation);
  }

  // Called when the element is removed from the page.
  disconnectedCallback () {
    if (this.lifecycle === LifecycleState.Disconnected) {
      return;
    }
    this.lifecycle = nextLifecycleState(this.lifecycle, 'disconnect');
    this.generation++; // invalidate any in-flight async initialization
    this.teardown();
  }

  /** Cancel the loop, drop listeners, dispose Three.js resources, remove the canvas. */
  teardown () {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    if (this.onWindowResize !== undefined) {
      window.removeEventListener('resize', this.onWindowResize);
      this.onWindowResize = undefined;
    }
    if (this.onDocumentMouseMove !== undefined) {
      document.removeEventListener('mousemove', this.onDocumentMouseMove);
      this.onDocumentMouseMove = undefined;
    }
    // Release GPU resources: geometry and material first, then the renderer.
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
    this.geometry = undefined;
    this.material = undefined;
    this.renderer = undefined;
    this.canvas?.remove();
    this.canvas = undefined;
  }

  /**
   * Route a failure to the honest degradation: transition to `fail` and tear
   * down, keeping the element decorative (transparent canvas, the night shows
   * through). The console note is the trail.
   *
   * @param {Error | undefined} [err]
   */
  fail (err) {
    this.lifecycle = nextLifecycleState(this.lifecycle, 'fail');
    this.generation++; // orphan any in-flight or scheduled work
    this.teardown();
    // eslint-disable-next-line no-console -- decoration failures must leave a trail
    console.warn('<kinetic-background>: stardust unavailable', err);
  }

  /**
   * Resolve the stardust color: `data-color` attribute, then the
   * `--pop-pink` design token, then the historical hardcoded value as
   * fallback (One Source Rule — the token is canonical).
   *
   * @returns {number}
   */
  resolveColor () {
    const rawColor = this.dataset.color;
    const attribute = parseHexColor(rawColor);
    if (attribute !== null) {
      return attribute;
    }
    if (rawColor !== undefined) {
      // eslint-disable-next-line no-console -- an explicit override silently dropped is a bug the author should hear about
      console.warn(`<kinetic-background>: ignoring invalid data-color="${rawColor}" — want #RRGGBB`);
    }
    const token = globalThis.getComputedStyle?.(document.documentElement).getPropertyValue('--pop-pink');
    const fromToken = parseHexColor(token);
    if (fromToken !== null) {
      return fromToken;
    }
    if (token.trim() !== '') {
      // eslint-disable-next-line no-console -- the token is canonical per DESIGN.md; an ignored redefinition must never be silent
      console.warn(`<kinetic-background>: token --pop-pink="${token.trim()}" not #RRGGBB — using fallback #${FALLBACK_COLOR.toString(16).toUpperCase()}`);
    }
    return FALLBACK_COLOR;
  }

  /**
   * Build the scene and start the appropriate motion mode.
   *
   * @param {number} generation — connect-generation token; a mismatch means
   *   the element detached (or reconnected) while the bundle was loading.
   */
  async initThree (generation) {
    try {
      const {
        AdditiveBlending,
        BufferAttribute,
        BufferGeometry,
        PerspectiveCamera,
        Points,
        PointsMaterial,
        Scene,
        Vector2,
        WebGLRenderer,
      } = await loadThree();

      // Detached (or reconnected) while the bundle was loading — start over.
      if (generation !== this.generation || this.canvas === undefined) {
        return;
      }

      const mouse = new Vector2();
      const scene = new Scene();
      const camera = new PerspectiveCamera(75, (window.innerWidth || 1) / (window.innerHeight || 1), 1, 1000);
      camera.position.z = CAMERA_Z;

      const renderer = new WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        powerPreference: 'low-power',
      });
      // Assign early — if any later step throws, teardown() must find the
      // renderer and its GL context to dispose them.
      this.renderer = renderer;

      // A lost context (GPU reset, resource exhaustion) must degrade via the
      // same fail path as any other error — never silently freeze a
      // `running` element. The listener lives on the canvas, so teardown's
      // canvas removal collects it.
      const onContextLost = (event) => {
        event.preventDefault();
        this.fail(new Error('WebGL context lost'));
      };
      this.canvas.addEventListener('webglcontextlost', onContextLost, false);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      renderer.setSize(window.innerWidth || 1, window.innerHeight || 1);

      const material = new PointsMaterial({
        color: this.resolveColor(),
        size: 1.5,
        blending: AdditiveBlending,
        transparent: true,
        opacity: 0.8,
      });
      this.material = material;
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(createParticlePositions(PARTICLE_COUNT, SPREAD), 3));
      this.geometry = geometry;
      const particles = new Points(geometry, material);
      scene.add(particles);

      // Resize keeps the projection honest; under reduced motion it is also
      // the one thing allowed to re-render (a single fresh frame).
      this.onWindowResize = () => {
        camera.aspect = (window.innerWidth || 1) / (window.innerHeight || 1);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth || 1, window.innerHeight || 1);
        if (this.motion === MotionPreference.Reduced) {
          try {
            renderer.render(scene, camera);
          } catch (err) {
            this.fail(err);
          }
        }
      };
      window.addEventListener('resize', this.onWindowResize, false);

      if (this.motion === MotionPreference.Reduced) {
        // Static frame: render the depth layer once, then freeze. No rAF
        // loop, no pointer listeners — reduced motion means no animation,
        // not no depth. Commit the state only after the render succeeds, so
        // a throwing first render fails honestly instead of leaving a
        // `static` element that never painted.
        try {
          renderer.render(scene, camera);
        } catch (err) {
          this.fail(err);
          return;
        }
        this.lifecycle = nextLifecycleState(this.lifecycle, 'ready', this.motion);
        return;
      }

      this.onDocumentMouseMove = (event) => {
        const { x, y } = normalizedMouse(event.clientX, event.clientY, window.innerWidth, window.innerHeight);
        mouse.x = x;
        mouse.y = y;
      };
      document.addEventListener('mousemove', this.onDocumentMouseMove, false);

      this.lifecycle = nextLifecycleState(this.lifecycle, 'ready', this.motion);
      const animate = () => {
        this.animationFrameId = requestAnimationFrame(animate);
        const now = performance.now();
        camera.position.x = easedCamera(camera.position.x, mouse.x * MOUSE_SWAY, EASE_FACTOR);
        camera.position.y = easedCamera(camera.position.y, -mouse.y * MOUSE_SWAY, EASE_FACTOR);
        camera.lookAt(scene.position);
        particles.rotation.y = starRotation(now);
        try {
          renderer.render(scene, camera);
        } catch (err) {
          // The loop re-schedules before rendering, so a throwing render
          // would otherwise burn 60 fps of failures — fail tears it down.
          this.fail(err);
        }
      };
      animate();
    } catch (err) {
      // A stale attempt — a newer connect owns the element — must not tear
      // down the live one (the shared module promise fans a rejection out to
      // every in-flight awaiter).
      if (generation !== this.generation) {
        return;
      }
      this.fail(err);
    }
  }
}

// Register the new element with the browser, making <kinetic-background> usable.
customElements.define('kinetic-background', KineticBackground);
