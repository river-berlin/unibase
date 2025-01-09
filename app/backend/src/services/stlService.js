import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

/**
 * Creates a Three.js geometry based on the primitive type and parameters
 */
function createGeometry(object) {
  const { type, params } = object;
  
  switch (type) {
    case 'cube': {
      const size = Array.isArray(params.size) 
        ? new THREE.Vector3(params.size[0], params.size[1], params.size[2])
        : new THREE.Vector3(params.size, params.size, params.size);
      return new THREE.BoxGeometry(size.x, size.y, size.z);
    }
    
    case 'sphere': {
      return new THREE.SphereGeometry(params.radius, 32, 32);
    }
    
    case 'cylinder': {
      return new THREE.CylinderGeometry(params.radius, params.radius, params.height, 32);
    }
    
    case 'polyhedron': {
      const geometry = new THREE.BufferGeometry();
      
      // Convert points array to Float32Array for vertices
      const vertices = new Float32Array(params.points.flat());
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      // Create faces
      const indices = new Uint16Array(params.faces.flat());
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      
      geometry.computeVertexNormals();
      return geometry;
    }
    
    default:
      throw new Error(`Unknown primitive type: ${type}`);
  }
}

/**
 * Generates an STL file from an array of 3D objects
 * @param {Array} objects - Array of 3D objects with type and params
 * @returns {Buffer} STL file contents as a buffer
 */
export function generateSTL(objects) {
  // Create a Three.js scene
  const scene = new THREE.Scene();
  
  // Add each object to the scene
  for (const object of objects) {
    const geometry = createGeometry(object);
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    
    // Set position
    mesh.position.set(...object.params.position);
    
    scene.add(mesh);
  }
  
  // Create STL exporter
  const exporter = new STLExporter();
  
  // Export scene to STL
  const stlString = exporter.parse(scene, { binary: true });
  
  // Convert to buffer
  return Buffer.from(stlString);
} 