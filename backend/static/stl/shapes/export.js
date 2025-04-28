// @ts-nocheck
import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";

/**
 * Converts a scene to STL format
 * 
 * @param {THREE.Scene} scene - The Three.js scene to convert
 * @param {Object} options - Options for STL generation
 * @param {boolean} [options.binary=false] - Whether to generate binary STL
 * @returns {string} The STL data as a string
 */
export function toStl(scene, options = { binary: false }) {
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
  return exporter.parse(exportScene, options);
}

/**
 * Converts an Object3D or array of Object3D instances to STL format
 * This function explicitly calls render() on each object to get the final mesh
 * 
 * @param {Object3D|Object3D[]} objects - The object(s) to convert to STL
 * @param {Object} options - Options for STL generation
 * @param {boolean} [options.binary=false] - Whether to generate binary STL
 * @returns {string} The STL data as a string
 */
export async function asStl(objects, options = { binary: false }) {
  const exportScene = new THREE.Scene();
  
  // Handle both single objects and arrays
  const objectsArray = Array.isArray(objects) ? objects : [objects];
  
  const renderedObjects = await Promise.all(objectsArray.map(object => object.render()));
  
  // Helper function to process an object and all its children recursively
  function processObject(object) {
    // Update world matrix to ensure correct transforms
    object.updateMatrixWorld(true);
    
    if (object.isMesh) {
      // It's a mesh - add a copy to the export scene
      const clonedMesh = object.clone();
      const geometry = clonedMesh.geometry.clone();
      
      // Apply the world matrix to get absolute position
      geometry.applyMatrix4(object.matrixWorld);
      
      const exportMesh = new THREE.Mesh(
        geometry,
        clonedMesh.material
      );
      
      // Reset transformation for the export mesh since transforms are baked into geometry
      exportMesh.position.set(0, 0, 0);
      exportMesh.rotation.set(0, 0, 0);
      exportMesh.scale.set(1, 1, 1);
      
      exportScene.add(exportMesh);
    } else if (object.isGroup) {
      // It's a group - process all its children
      // which may also be groups
      // so recursion
      object.children.forEach(child => processObject(child));
    }
  }
  
  // Process all rendered objects
  renderedObjects.forEach(obj => processObject(obj));
  
  const exporter = new STLExporter();
  return exporter.parse(exportScene, options);
}
