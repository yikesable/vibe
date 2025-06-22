// HUG Principle: Guided - We import Three.js directly from a CDN.
// This makes the dependency explicit and requires no build step.
// This is the recommended approach for creating self-contained components.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

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
    constructor() {
        super();
        // Attach a Shadow DOM to encapsulate the component's styles and markup.
        this.attachShadow({ mode: 'open' });
        this.animationFrameId = null; // To keep track of the animation frame
    }

    // Called when the element is added to the page's DOM.
    connectedCallback() {
        // Set up the component's base styles.
        this.style.position = 'fixed';
        this.style.top = '0';
        this.style.left = '0';
        this.style.width = '100%';
        this.style.height = '100%';
        this.style.zIndex = '0';
        this.style.pointerEvents = 'none';

        const canvas = document.createElement('canvas');
        this.shadowRoot.appendChild(canvas);

        // HUG Principle: Humane - Check the user's motion preferences.
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!motionQuery.matches) {
            this.initThree(canvas);
        } else {
            // If the user prefers reduced motion, do nothing. The canvas will remain blank.
            // An alternative would be to remove the element entirely: this.remove();
        }
    }

    // Called when the element is removed from the page.
    disconnectedCallback() {
        // HUG Principle: Humane - Clean up to prevent memory leaks.
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Remove event listeners if they were added
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('mousemove', this.onDocumentMouseMove);
    }
    
    // All the Three.js logic is now safely inside the component.
    initThree(canvas) {
        let camera, scene, renderer;
        let particles;
        const particleCount = 2000;
        const mouse = new THREE.Vector2();

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 400;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const pMaterial = new THREE.PointsMaterial({
            color: 0xFF00A9, // This could be made customizable via a 'data-color' attribute.
            size: 1.5,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 1000;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles = new THREE.Points(geometry, pMaterial);
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
