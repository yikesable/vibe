// Entry point for esbuild — global (IIFE) Three.js build for
// stories/jsdoc-types.html's <particle-field>. r160 removed the UMD build
// (`build/three.min.js` no longer ships), so the old copy step died; this
// reconstructs the global-THREE contract on top of the module build.
import * as THREE from 'three';

globalThis.THREE = THREE;
