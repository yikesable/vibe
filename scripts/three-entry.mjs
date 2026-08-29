// Entry point for esbuild — tree-shaken Three.js for <kinetic-background>.
// Named imports of exactly what components/kinetic-background.js uses; the
// module bundle re-exports them so the component's dynamic import
// destructuring keeps working. `three` declares sideEffects: false, so
// esbuild drops the renderer machinery's unused branches… honest
// expectation: ~25–40% off the full module (WebGLRenderer drags in most
// of the core), not the 80% naive estimates promise.
export {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
