// HUG Principle: Guided - We import Three.js from a local vendor copy.
// Built from node_modules via npm run build:vendor.
import * as THREE from '../vendor/three.module.bundle.js';

/**
 * @class KineticBackground
 * A self-contained Web Component that creates a kinetic, mouse-interactive particle background.
 *
 * HUG Principle: Humane & Usable
 * - Encapsulates all logic within the class (no global pollution).
 * - Manages its own styles and lifecycle.
 * - Respects user's motion preferences.
 */
class KineticBackground extends HTMLElement {
  constructor () {
    super();
    // Attach a Shadow DOM to encapsulate the component's styles and markup.
    this.attachShadow({ mode: 'open' });
    this.animationFrameId = undefined; // To keep track of the animation frame
  }

  // Called when the element is added to the page's DOM.
  connectedCallback () {
    // Set up the component's base styles.
    this.style.position = 'fixed';
    this.style.top = '0';
    this.style.left = '0';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.zIndex = '0';
    this.style.pointerEvents = 'none';

    const canvas = document.createElement('canvas');
    this.shadowRoot.append(canvas);

    // HUG Principle: Humane - Check the user's motion preferences.
    const motionQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    if (!motionQuery.matches) {
      this.initThree(canvas);
    } else {
      // If the user prefers reduced motion, do nothing. The canvas will remain blank.
      // An alternative would be to remove the element entirely: this.remove();
    }
  }

  // Called when the element is removed from the page.
  disconnectedCallback () {
    // HUG Principle: Humane - Clean up to prevent memory leaks.
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Remove event listeners if they were added
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
  }

  // All the Three.js logic is now safely inside the component.
  initThree (canvas) {
    const particleCount = 2000;
    const mouse = new THREE.Vector2();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const pMaterial = new THREE.PointsMaterial({
      color: 0xFF00A9, // This could be made customizable via a 'data-color' attribute.
      size: 1.5,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 1000;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Bind event listeners to the class instance for proper removal on disconnect.
    this.onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    this.onDocumentMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.00005;
      camera.position.x += (mouse.x * 50 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 50 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      particles.rotation.y = time * 0.4;
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', this.onWindowResize, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    animate();
  }
}

// Register the new element with the browser, making <kinetic-background> usable.
customElements.define('kinetic-background', KineticBackground);
