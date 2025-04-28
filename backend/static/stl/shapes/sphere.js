// @ts-nocheck
import * as THREE from "three";
import { Object3D } from "./object.js";

/**
 * Class representing a sphere object
 */
export class Sphere extends Object3D {
  /**
   * Create a new sphere
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {number} options.radius - The radius of the sphere
   * @param {number} [options.widthSegments=32] - Number of horizontal segments
   * @param {number} [options.heightSegments=16] - Number of vertical segments
   */
  constructor(options = {}) {
    super(options);
    this.radius = options.radius;
    this.widthSegments = options.widthSegments || 32;
    this.heightSegments = options.heightSegments || 16;
  }

  /**
   * Render the sphere to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The rendered THREE.js mesh
   */
  render() {
    const geometry = new THREE.SphereGeometry(
      this.radius,
      this.widthSegments,
      this.heightSegments
    );
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    return this.applyPosition(mesh);
  }
}

/**
 * Factory function to create a sphere
 * 
 * @param {Object} options - The configuration options
 * @returns {Sphere} A new Sphere instance
 */
export function sphere(options) {
  return new Sphere(options);
}
