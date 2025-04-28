// @ts-nocheck
import * as THREE from "three";
import { Object3D } from "./object.js";

/**
 * Class representing a cylinder object
 */
export class Cylinder extends Object3D {
  /**
   * Create a new cylinder
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {number} options.radius - The radius of the cylinder
   * @param {number} options.height - The height of the cylinder
   * @param {number} [options.radialSegments=32] - Number of segmented faces around the circumference
   */
  constructor(options = {}) {
    super(options);
    this.radius = options.radius;
    this.height = options.height;
    this.radialSegments = options.radialSegments || 32;
  }

  /**
   * Render the cylinder to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The rendered THREE.js mesh
   */
  render() {
    const geometry = new THREE.CylinderGeometry(
      this.radius,
      this.radius,
      this.height,
      this.radialSegments
    );
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    return this.applyPositionAndRotation(mesh);
  }
}

/**
 * Factory function to create a cylinder
 * 
 * @param {Object} options - The configuration options
 * @returns {Cylinder} A new Cylinder instance
 */
export function cylinder(options) {
  return new Cylinder(options);
}
