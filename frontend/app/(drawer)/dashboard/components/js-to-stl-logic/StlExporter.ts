/**
 * StlExporter.ts - A utility for generating STL files from JavaScript code using Three.js
 * 
 * This module creates a hidden iframe in the document that runs Three.js and converts
 * JavaScript code into STL data. It handles all the communication with the iframe.
 * 
 * It includes helper functions from basics.js to simplify 3D shape creation.
 */

import { setupIframe, runInIframe, removeIframe } from './IframeRunner';
import type { IframeState } from './IframeRunner';
import { BASICS } from "./helpers/basics"

// Type for code files
export type CodeFile = { 
  id?: string; 
  object?: string; 
  project_id?: string;
  created_at?: string;
  updated_at?: string;
};

// Module state
let iframeState: IframeState | null = null;


const THREE_IMPORTS_HTML = `
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/examples/jsm/controls/OrbitControls": "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js",
      "three/examples/jsm/exporters/STLExporter": "https://unpkg.com/three@0.160.0/examples/jsm/exporters/STLExporter.js",
      "three-csg-ts": "https://unpkg.com/three-csg-ts@3.2.0/lib/esm/index.js"
    }
  }
  </script>
`;

/**
 * Initialize the StlExporter
 */
export async function initStlExporter(): Promise<void> {
  if (!iframeState) {
    iframeState = await setupIframe(THREE_IMPORTS_HTML);
  }
}

/**
 * Generate an STL from code files
 */
export async function generateStl(code : string): Promise<string> {
  if (!iframeState) {
    throw new Error('StlExporter not initialized');
  }
  

  // Create scene and execute code
  const executeCode = `
    import * as THREE from 'three';
    import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
    import { CSG } from 'three-csg-ts';
    
    // Include basics.js helper functions
    ${BASICS}

    function generateStlFromScene(scene) {
      const exportScene = new THREE.Scene();
      
      scene.traverse((object) => {
        if (object.isMesh) {
          const clonedMesh = object.clone();
          const geometry = clonedMesh.geometry.clone();
          
          object.updateMatrixWorld(true);
          geometry.applyMatrix4(object.matrixWorld);
          
          const exportMesh = new THREE.Mesh(
            geometry,
            clonedMesh.material
          );
          
          exportMesh.position.set(0, 0, 0);
          exportMesh.rotation.set(0, 0, 0);
          exportMesh.scale.set(1, 1, 1);
          
          exportScene.add(exportMesh);
        }
      });
      
      const exporter = new STLExporter();
      return exporter.parse(exportScene, { binary: false });
    }
    
    const scene = new THREE.Scene();
    
    ${code}

    
    export const stl = generateStlFromScene(scene);
  `;

  return runInIframe(iframeState, executeCode);
}

/**
 * Clean up the StlExporter
 */
export function cleanupStlExporter(): void {
  if (iframeState) {
    removeIframe(iframeState);
    iframeState = null;
  }
}
