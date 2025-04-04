// Import map for Three.js and related libraries
// This code isn't sanitized, and is directly run in the iframe
// so be careful while passing user generated code here
// maybe for safety, actually, just don't pass user generated code here

// The content of basics.js as a string
export const BASICS = `// @ts-nocheck
/* This file is intentionally excluded from TypeScript type checking 
It's some basic functions to make writing basic threejs code easier

These helper functions provide a simplified API for creating common 3D shapes
and performing operations with them. This makes it easier to create 3D models
without having to write repetitive ThreeJS boilerplate code.
*/

/**
 * Creates a cuboid (box) mesh with the specified parameters
 * 
 * @param {Object} options - The configuration options
 * @param {Object} options.position - The position coordinates of the cuboid
 * @param {number} options.position.x - The x position of the cuboid
 * @param {number} options.position.y - The y position of the cuboid
 * @param {number} options.position.z - The z position of the cuboid
 * @param {number} options.width - The width of the cuboid (x-axis)
 * @param {number} options.height - The height of the cuboid (y-axis)
 * @param {number} options.depth - The depth of the cuboid (z-axis)
 * @param {number|string} [options.color=0x00ff00] - The color of the cuboid (hex number or CSS color string)
 * @returns {THREE.Mesh} The created cuboid mesh
 */
function cuboid({ position, width, height, depth, color = 0x00ff00 }) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cuboid = new THREE.Mesh(geometry, material);
  cuboid.position.set(position.x, position.y, position.z);
  return cuboid;
}

/**
 * Creates a sphere mesh with the specified parameters
 * 
 * @param {Object} options - The configuration options
 * @param {Object} options.position - The position coordinates of the sphere
 * @param {number} options.position.x - The x position of the sphere
 * @param {number} options.position.y - The y position of the sphere
 * @param {number} options.position.z - The z position of the sphere
 * @param {number} options.radius - The radius of the sphere
 * @param {number} [options.widthSegments=32] - Number of horizontal segments
 * @param {number} [options.heightSegments=16] - Number of vertical segments
 * @param {number|string} [options.color=0x00ff00] - The color of the sphere (hex number or CSS color string)
 * @returns {THREE.Mesh} The created sphere mesh
 */
function sphere({ position, radius, widthSegments = 32, heightSegments = 16, color = 0x00ff00 }) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(position.x, position.y, position.z);
  return sphere;  
}

/**
 * Creates a cylinder mesh with the specified parameters
 * 
 * @param {Object} options - The configuration options
 * @param {Object} options.position - The position coordinates of the cylinder
 * @param {number} options.position.x - The x position of the cylinder
 * @param {number} options.position.y - The y position of the cylinder
 * @param {number} options.position.z - The z position of the cylinder
 * @param {number} options.radius - The radius of the cylinder
 * @param {number} options.height - The height of the cylinder
 * @param {number} [options.radialSegments=32] - Number of segmented faces around the circumference
 * @param {number|string} [options.color=0x00ff00] - The color of the cylinder
 * @returns {THREE.Mesh} The created cylinder mesh
 */
function cylinder({ position, radius, height, radialSegments = 32, color = 0x00ff00 }) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.set(position.x, position.y, position.z);
  return cylinder;
}

/**
 * Creates a cone mesh with the specified parameters
 * 
 * @param {Object} options - The configuration options
 * @param {Object} options.position - The position coordinates of the cone
 * @param {number} options.position.x - The x position of the cone
 * @param {number} options.position.y - The y position of the cone
 * @param {number} options.position.z - The z position of the cone
 * @param {number} options.radius - The radius of the cone base
 * @param {number} options.height - The height of the cone
 * @param {number} [options.radialSegments=32] - Number of segmented faces around the circumference
 * @param {number|string} [options.color=0x00ff00] - The color of the cone
 * @returns {THREE.Mesh} The created cone mesh
 */
function cone({ position, radius, height, radialSegments = 32, color = 0x00ff00 }) {
  const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cone = new THREE.Mesh(geometry, material);
  cone.position.set(position.x, position.y, position.z);
  return cone;
}

/**
 * Performs a CSG union operation between two meshes
 * 
 * @param {Object} options - The configuration options
 * @param {THREE.Mesh} options.meshA - The first mesh
 * @param {THREE.Mesh} options.meshB - The second mesh
 * @param {number|string} [options.color=0x00ff00] - The color of the resulting mesh
 * @returns {THREE.Mesh} The resulting mesh from the union operation
 */
function union({ meshA, meshB, color = 0x00ff00 }) {
  // Make sure matrices are up to date
  meshA.updateMatrix();
  meshB.updateMatrix();
  
  // Perform CSG union operation
  const result = CSG.union(meshA, meshB);
  
  // Set material if color is provided
  if (color) {
    result.material = new THREE.MeshBasicMaterial({ color: color });
  }
  
  return result;
}

/**
 * Performs a CSG subtraction operation between two meshes (meshB subtracted from meshA)
 * 
 * @param {Object} options - The configuration options
 * @param {THREE.Mesh} options.meshA - The mesh to subtract from
 * @param {THREE.Mesh} options.meshB - The mesh to subtract
 * @param {number|string} [options.color=0x00ff00] - The color of the resulting mesh
 * @returns {THREE.Mesh} The resulting mesh from the subtraction operation
 */
function subtract({ meshA, meshB, color = 0x00ff00 }) {
  // Make sure matrices are up to date
  meshA.updateMatrix();
  meshB.updateMatrix();
  
  // Perform CSG subtraction operation
  const result = CSG.subtract(meshA, meshB);
  
  // Set material if color is provided
  if (color) {
    result.material = new THREE.MeshBasicMaterial({ color: color });
  }
  
  return result;
}

/**
 * Performs a CSG intersection operation between two meshes
 * 
 * @param {Object} options - The configuration options
 * @param {THREE.Mesh} options.meshA - The first mesh
 * @param {THREE.Mesh} options.meshB - The second mesh
 * @param {number|string} [options.color=0x00ff00] - The color of the resulting mesh
 * @returns {THREE.Mesh} The resulting mesh from the intersection operation
 */
function intersect({ meshA, meshB, color = 0x00ff00 }) {
  // Make sure matrices are up to date
  meshA.updateMatrix();
  meshB.updateMatrix();
  
  // Perform CSG intersection operation
  const result = CSG.intersect(meshA, meshB);
  
  // Set material if color is provided
  if (color) {
    result.material = new THREE.MeshBasicMaterial({ color: color });
  }
  
  return result;
}`;