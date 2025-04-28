// @ts-nocheck
import * as THREE from "three";
import { CSGOperation } from "./operations.js";

/**
 * Base class for all 3D objects
 */
class Object3D extends CSGOperation {
  /**
   * Create a new 3D object
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   */
  constructor(options = {}) {
    super(options);
    this._dimensions = null;
  }

  // Dimensions getter is now inherited from CSGOperation

  /**
   * Render the object to a THREE.js mesh
   * This should be implemented by subclasses
   * 
   * @returns {THREE.Mesh} The rendered THREE.js mesh
   */
  render() {
    throw new Error("render() method must be implemented by subclasses");
  }

  /**
   * Apply the position to a mesh
   * 
   * @param {THREE.Mesh} mesh - The mesh to apply the position to
   * @returns {THREE.Mesh} The mesh with the position applied
   */
  applyPosition(mesh) {
    mesh.position.set(this.position.x, this.position.y, this.position.z);
    return mesh;
  }

  /**
   * Apply the rotation to a mesh
   * 
   * @param {THREE.Mesh} mesh - The mesh to apply the rotation to
   * @returns {THREE.Mesh} The mesh with the rotation applied
   */
  applyRotation(mesh) {
    mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    return mesh;
  }

  /**
   * Union this object with another object
   * 
   * @param {Object3D} object - The object to union with
   * @param {Object} [diff] - Optional position adjustment
   * @param {number} [diff.x=0] - X position adjustment
   * @param {number} [diff.y=0] - Y position adjustment
   * @param {number} [diff.z=0] - Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  union(object, diff = {}) {
    // This method is inherited from CSGOperation
    return super.union(object, diff);
  }

  /**
   * Alias for union
   */
  add(object, diff = {}) {
    return this.union(object, diff);
  }

  /**
   * Get the intersection of this object with another object
   * 
   * @param {Object3D} object - The object to intersect with
   * @param {Object} [diff] - Optional position adjustment
   * @param {number} [diff.x=0] - X position adjustment
   * @param {number} [diff.y=0] - Y position adjustment
   * @param {number} [diff.z=0] - Z position adjustment
   * @returns {IntersectOperation} The resulting intersection operation
   */
  getIntersection(object, diff = {}) {
    // This method is inherited from CSGOperation
    return super.getIntersection(object, diff);
  }
}

export { Object3D };
