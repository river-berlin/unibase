// @ts-nocheck
import * as THREE from "three";
import { Object3D } from "./object.js";

/**
 * Class representing a cuboid (box) object
 */
export class Cuboid extends Object3D {
  /**
   * Create a new cuboid
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {number} options.width - The width of the cuboid (x-axis)
   * @param {number} options.height - The height of the cuboid (y-axis)
   * @param {number} options.depth - The depth of the cuboid (z-axis)
   */
  constructor(options = {}) {
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.depth = options.depth;
  }

  /**
   * Render the cuboid to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The rendered THREE.js mesh
   */
  render() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshBasicMaterial();
    let mesh = new THREE.Mesh(geometry, material);
    mesh = this.applyPositionAndRotation(mesh);
    return mesh;
  }
}

/**
 * Class representing a cube (equal-sided cuboid) object
 */
export class Cube extends Cuboid {
  /**
   * Create a new cube
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {number} options.size - The size of the cube (all dimensions)
   */
  constructor(options = {}) {
    super({
      ...options,
      width: options.size,
      height: options.size,
      depth: options.size
    });
    this.size = options.size;
  }
}

/**
 * Factory function to create a cuboid
 * 
 * @param {Object} options - The configuration options
 * @returns {Cuboid} A new Cuboid instance
 */
export function cuboid(options) {
  return new Cuboid(options);
}

/**
 * Factory function to create a cube
 * 
 * @param {Object} options - The configuration options
 * @returns {Cube} A new Cube instance
 */
export function cube(options) {
  return new Cube(options);
}
