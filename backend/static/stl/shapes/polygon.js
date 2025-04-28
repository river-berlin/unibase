// @ts-nocheck
import * as THREE from "three";
import { Object3D } from "./object.js";
import earcut from "earcut";

/**
 * Class representing a polygon object
 */
export class Polygon extends Object3D {
  /**
   * Create a new polygon
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {Array<Array<number>>} [options.points] - Array of [x,z] points defining the polygon shape
   * @param {string} [options.color] - The color of the polygon
   */
  constructor(options = {}) {
    super(options);
    
    // Store properties
    this.color = options.color;
    
    // Handle points input
    if (options.points && Array.isArray(options.points)) {
      this.points = options.points;
    } else {
      // Default to a simple square if no points provided
      this.points = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1]
      ];
    }
  }

  /**
   * Render the polygon to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The rendered THREE.js mesh
   */
  render() {
    // Create a custom geometry for the 2D polygon
    const geometry = new THREE.BufferGeometry();
    
    // Create vertices directly on the XZ plane (Y=0)
    const vertices = [];
    
    // Create all vertices from points
    for (let i = 0; i < this.points.length; i++) {
      const [x, z] = this.points[i];
      vertices.push(x, 0, z); // All vertices on y=0 plane
    }
    
    // Use earcut to triangulate the face
    const flatPoints = this.points.flat();
    const earcutIndices = earcut(flatPoints)

    console.log("gets here successfully!!!", earcutIndices);
    
    // Set vertices and indices
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(earcutIndices);
    
    // Compute normals
    geometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    
    return mesh
  }
}

/**
 * Factory function to create a polygon
 * 
 * @param {Object} options - The configuration options
 * @returns {Polygon} A new Polygon instance
 */
export function polygon(options) {
  return new Polygon(options);
}
