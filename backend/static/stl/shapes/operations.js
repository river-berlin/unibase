// @ts-nocheck
import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { ADDITION, SUBTRACTION, INTERSECTION, Brush, Evaluator } from "three-bvh-csg";

/**
 * Helper function to add dummy UV coordinates to a geometry if they don't exist
 * @param {THREE.BufferGeometry} geometry - The geometry to add UVs to
 */
function ensureUVs(geometry) {
  // Check if UVs already exist
  if (geometry.attributes.uv) {
    return; // UVs already exist, nothing to do
  }
  
  // Check if positions exist
  if (!geometry.attributes.position) {
    // No positions defined yet, create a dummy UV attribute with zero entries
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(0), 2));
    return;
  }
  
  // Get position data
  const positions = geometry.attributes.position;
  const count = positions.count;
  
  // Create UV array
  const uvs = new Float32Array(count * 2);
  
  // Create simple planar UVs based on normalized position
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0;
    
    try {
      x = positions.getX(i) || 0;
      y = positions.getY(i) || 0;
    } catch (e) {
      // If there's an error reading position data, use default values
      console.log('Warning: Error reading position data for UV calculation');
    }
    
    // Simple planar mapping - can be improved for specific shapes
    uvs[i * 2] = (x + 1) / 2;      // U coordinate between 0 and 1
    uvs[i * 2 + 1] = (y + 1) / 2;  // V coordinate between 0 and 1
  }
  
  // Apply UV coordinates to geometry
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
}

/**
 * Base class for all 3D objects and operations
 */
export class CSGOperation {
  /**
   * Create a new CSG operation
   * 
   * @param {Object} options - The configuration options
   * @param {Object[]} [options.objects] - The objects to perform the operation on
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {Object} [options.rotation] - The rotation coordinates in radians
   * @param {number} [options.rotation.x=0] - The x rotation
   * @param {number} [options.rotation.y=0] - The y rotation
   * @param {number} [options.rotation.z=0] - The z rotation
   */
  constructor(options = {}) {
    this._position = options.position || {};

    // Default position values
    this._position.x = this._position.x || 0;
    this._position.y = this._position.y || 0;
    this._position.z = this._position.z || 0;

    this._rotation = options.rotation || {};
    
    // Default rotation values (in radians)
    this._rotation.x = this._rotation.x || 0;
    this._rotation.y = this._rotation.y || 0;
    this._rotation.z = this._rotation.z || 0;

    this.objects = options.objects || [];
    this._dimensions = null;
  }
  
  /**
   * Get the position of the object
   * 
   * @returns {Object} The position object with x, y, and z properties
   * This is overriden for Union operations
   */
  get position() {
    return this._position;
  }
  
  /**
   * Set the position of the object
   * 
   * @param {Object} newPosition - The new position object with x, y, and z properties
   * This is overriden for Union operations
   */
  set position(newPosition) {
    this._position = newPosition || { x: 0, y: 0, z: 0 };
  }
  
  /**
   * Get the rotation of the object
   * 
   * @returns {Object} The rotation object with x, y, and z properties (in radians)
   */
  get rotation() {
    return this._rotation;
  }
  
  /**
   * Set the rotation of the object
   * 
   * @param {Object} newRotation - The new rotation object with x, y, and z properties (in radians)
   */
  set rotation(newRotation) {
    this._rotation = newRotation || { x: 0, y: 0, z: 0 };
  }

  /**
   * Get the bounding box of the object
   * 
   * @returns {THREE.Box3|null} The bounding box of the object or null if it can't be calculated
   */
  getBoundingBox() {
    const mesh = this.render();
    if (mesh && mesh.geometry) {
      mesh.geometry.computeBoundingBox();
      const geometryBox = mesh.geometry.boundingBox.clone();
      
      // Transform the bounding box by the mesh's matrix to get world coordinates
      mesh.updateMatrix();
      geometryBox.applyMatrix4(mesh.matrix);
      
      return geometryBox;
    }
    return null;
  }

  /**
   * Get the dimensions of the object (width, height, depth)
   * This should be implemented by subclasses that have specific dimensions
   * 
   * @returns {Object} The dimensions object with width, height, and depth properties
   */
  get dimensions() {
    if (!this._dimensions) {
      // Default implementation - calculate from geometry bounds
      const box = this.getBoundingBox();
      if (box) {
        const size = new THREE.Vector3();
        box.getSize(size);
        
        this._dimensions = {
          width: size.x,
          height: size.y,
          depth: size.z
        };
      } else {
        // Default fallback dimensions
        this._dimensions = { width: 0, height: 0, depth: 0 };
      }
    }
    return this._dimensions;
  }

  /**
   * Add an object to the operation
   * 
   * @param {CSGOperation} object - The object to add
   * @returns {CSGOperation} This operation for chaining
   */
  add(object) {
    this.objects.push(object);
    return this;
  }
  
  /**
   * Union this object with another object
   * 
   * @param {CSGOperation} object - The object to union with
   * @param {Object} [diff] - Optional position adjustment
   * @param {number} [diff.x=0] - X position adjustment
   * @param {number} [diff.y=0] - Y position adjustment
   * @param {number} [diff.z=0] - Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  union(object, diff = {}) {
    // Apply position adjustment to the object being added
    if (diff.x !== undefined || diff.y !== undefined || diff.z !== undefined) {
      const newPosition = { ...object.position };
      if (diff.x !== undefined) newPosition.x += diff.x;
      if (diff.y !== undefined) newPosition.y += diff.y;
      if (diff.z !== undefined) newPosition.z += diff.z;
      object.position = newPosition;
    }
    
    // Return the actual union operation
    return new UnionOperation({ objects: [this, object] });
  }

  /**
   * Subtract another object from this object
   * 
   * @param {CSGOperation} object - The object to subtract
   * @param {Object} [diff] - Optional position adjustment
   * @param {number} [diff.x=0] - X position adjustment
   * @param {number} [diff.y=0] - Y position adjustment
   * @param {number} [diff.z=0] - Z position adjustment
   * @returns {SubtractOperation} The resulting subtraction operation
   */
  subtract(object, diff = {}) {
    // Apply position adjustment to the object being subtracted
    if (diff.x !== undefined || diff.y !== undefined || diff.z !== undefined) {
      const newPosition = { ...object.position };
      if (diff.x !== undefined) newPosition.x += diff.x;
      if (diff.y !== undefined) newPosition.y += diff.y;
      if (diff.z !== undefined) newPosition.z += diff.z;
      object.position = newPosition;
    }
    
    // For subtraction, we keep the position of the base object
    // since that's what remains after subtraction
    return new SubtractOperation({ objects: [this, object], position: this.position });
  }

  /**
   * Get the intersection of this object with another object
   * 
   * @param {CSGOperation} object - The object to intersect with
   * @param {Object} [diff] - Optional position adjustment
   * @param {number} [diff.x=0] - X position adjustment
   * @param {number} [diff.y=0] - Y position adjustment
   * @param {number} [diff.z=0] - Z position adjustment
   * @returns {IntersectOperation} The resulting intersection operation
   */
  getIntersection(object, diff = {}) {
    // Apply position adjustment to the object being intersected
    if (diff.x !== undefined || diff.y !== undefined || diff.z !== undefined) {
      const newPosition = { ...object.position };
      if (diff.x !== undefined) newPosition.x += diff.x;
      if (diff.y !== undefined) newPosition.y += diff.y;
      if (diff.z !== undefined) newPosition.z += diff.z;
      object.position = newPosition;
    }
    
    // For intersection, the new position is the average of the two objects' positions
    const newIntersectionPosition = { 
      x: (this.position.x + object.position.x) / 2 + (diff.x || 0),
      y: (this.position.y + object.position.y) / 2 + (diff.y || 0),
      z: (this.position.z + object.position.z) / 2 + (diff.z || 0)
    };
    
    return new IntersectOperation({ objects: [this, object], position: newIntersectionPosition });
  }
  
  /**
   * Add an object above this object
   * 
   * @param {CSGOperation} object - The object to add above
   * @param {Object} [diff] - Optional additional position adjustment
   * @param {number} [diff.x=0] - Additional X position adjustment
   * @param {number} [diff.y=0] - Additional Y position adjustment
   * @param {number} [diff.z=0] - Additional Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  addAbove(object, diff = {}) {
    const myBoundingBox = this.getBoundingBox();
    const objectHeight = object.dimensions.height;
    
    // Calculate position: top of this object's bounding box + half height of the new object
    const newPosition = { 
      x: this.position.x + (diff.x || 0),
      y: this.position.y + objectHeight/2 + this.dimensions.height/2 + (diff.y || 0),
      z: this.position.z + (diff.z || 0)
    };
    
    object.position = newPosition;
    
    if(this.constructor.name !== "UnionOperation") {
      // Create the union - position will be automatically calculated by the getter
      const union = new UnionOperation({ objects: [this, object] });
      return union;
    }
    
    this.objects.push(object);
    return this;
  }

  /**
   * Add an object below this object
   * 
   * @param {CSGOperation} object - The object to add below
   * @param {Object} [diff] - Optional additional position adjustment
   * @param {number} [diff.x=0] - Additional X position adjustment
   * @param {number} [diff.y=0] - Additional Y position adjustment
   * @param {number} [diff.z=0] - Additional Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  addBelow(object, diff = {}) {
    const myBoundingBox = this.getBoundingBox();
    const objectHeight = object.dimensions.height;
    
    // Calculate position: bottom of this object's bounding box - half height of the new object
    const newPosition = { 
      x: this.position.x + (diff.x || 0),
      y: this.position.y - object.dimensions.height/2 - this.dimensions.height/2 + (diff.y || 0),
      z: this.position.z + (diff.z || 0)
    };
    
    object.position = newPosition;
    return new UnionOperation({ objects: [this, object] });;
  }

  /**
   * Add an object to the left of this object
   * 
   * @param {CSGOperation} object - The object to add to the left
   * @param {Object} [diff] - Optional additional position adjustment
   * @param {number} [diff.x=0] - Additional X position adjustment
   * @param {number} [diff.y=0] - Additional Y position adjustment
   * @param {number} [diff.z=0] - Additional Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  addLeft(object, diff = {}) {
    const myBoundingBox = this.getBoundingBox();
    const objectWidth = object.dimensions.width;
    
    // Calculate position: left of this object's bounding box - half width of the new object
    const newPosition = { 
      x: this.position.x - objectWidth/2 - this.dimensions.width/2 + (diff.x || 0),
      y: this.position.y + (diff.y || 0),
      z: this.position.z + (diff.z || 0)
    };
    
    object.position = newPosition;
    
    // Create the union - position will be automatically calculated by the getter
    const union = new UnionOperation({ objects: [this, object] });
    return union;
  }

  /**
   * Add an object to the right of this object
   * 
   * @param {CSGOperation} object - The object to add to the right
   * @param {Object} [diff] - Optional additional position adjustment
   * @param {number} [diff.x=0] - Additional X position adjustment
   * @param {number} [diff.y=0] - Additional Y position adjustment
   * @param {number} [diff.z=0] - Additional Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  addRight(object, diff = {}) {
    const myBoundingBox = this.getBoundingBox();
    const objectWidth = object.dimensions.width;
    
    // Calculate position: right of this object's bounding box + half width of the new object
    const newPosition = { 
      x: this.position.x + objectWidth/2 + this.dimensions.width/2 + (diff.x || 0),
      y: this.position.y + (diff.y || 0),
      z: this.position.z + (diff.z || 0)
    };
    
    object.position = newPosition;
    
    // Create the union - position will be automatically calculated by the getter
    const union = new UnionOperation({ objects: [this, object] });
    return union;
  }

  /**
   * Add an object in front of this object
   * 
   * @param {CSGOperation} object - The object to add in front
   * @param {Object} [diff] - Optional additional position adjustment
   * @param {number} [diff.x=0] - Additional X position adjustment
   * @param {number} [diff.y=0] - Additional Y position adjustment
   * @param {number} [diff.z=0] - Additional Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  addFront(object, diff = {}) {
    const myBoundingBox = this.getBoundingBox();
    const objectDepth = object.dimensions.depth;
    
    // Calculate position: front of this object's bounding box + half depth of the new object
    const newPosition = { 
      x: this.position.x + (diff.x || 0),
      y: this.position.y + (diff.y || 0),
      z: this.position.z + objectDepth/2 + this.dimensions.depth/2 + (diff.z || 0)
    };
    
    object.position = newPosition;
    
    // Create the union - position will be automatically calculated by the getter
    const union = new UnionOperation({ objects: [this, object] });
    return union;
  }

  /**
   * Add an object behind this object
   * 
   * @param {CSGOperation} object - The object to add behind
   * @param {Object} [diff] - Optional additional position adjustment
   * @param {number} [diff.x=0] - Additional X position adjustment
   * @param {number} [diff.y=0] - Additional Y position adjustment
   * @param {number} [diff.z=0] - Additional Z position adjustment
   * @returns {UnionOperation} The resulting union operation
   */
  addBehind(object, diff = {}) {
    const myBoundingBox = this.getBoundingBox();
    const objectDepth = object.dimensions.depth;
    
    // Calculate position: behind this object's bounding box - half depth of the new object
    const newPosition = { 
      x: this.position.x + (diff.x || 0),
      y: this.position.y + (diff.y || 0),
      z: this.position.z - objectDepth/2 - this.dimensions.depth/2 + (diff.z || 0)
    };
    
    object.position = newPosition;
    
    // Create the union - position will be automatically calculated by the getter
    const union = new UnionOperation({ objects: [this, object] });
    return union;
  }

  /**
   * Perform the CSG operation on the objects
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  performOperation() {
    throw new Error("performOperation() method must be implemented by subclasses");
  }
  
  /**
   * Render the object to a THREE.js mesh
   * This is implemented in the base class for operations
   * 
   * @returns {THREE.Mesh} The rendered mesh
   */
  render() {
    if (this.objects.length === 0) {
      return new THREE.Mesh();
    }

    if (this.objects.length === 1) {
      return this.objects[0].render();
    }

    const result = this.performOperation();
    return this.applyPositionAndRotation(result);
  }
  
  /**
   * Apply the position and rotation to a mesh
   * 
   * @param {THREE.Mesh} mesh - The mesh to apply the position and rotation to
   * @returns {THREE.Mesh} The mesh with the position and rotation applied
   */
  applyPositionAndRotation(mesh) {
    const pos = this.position;
    const rot = this.rotation;
    
    // Apply position
    mesh.position.set(pos.x, pos.y, pos.z);
    
    // Apply rotation (in radians)
    mesh.rotation.set(rot.x, rot.y, rot.z);
    mesh.updateMatrix();
    mesh.updateMatrixWorld(true);
    
    return mesh;
  }
}

/**
 * Class representing a union operation
 */
export class UnionOperation extends CSGOperation {
  constructor(options = {}) {
    super(options);
  }
  
  /**
   * Get the position of the union operation
   * This calculates the center of the combined bounding box of all objects
   * 
   * @returns {Object} The position object with x, y, and z properties
   */
  get position() {
    // Get the bounding box of the union
    const box = this.getBoundingBox();
    if (box) {
      // Calculate the center of the bounding box
      const center = new THREE.Vector3();
      box.getCenter(center);
      return { x: center.x, y: center.y, z: center.z };
    }
    
    // Fallback to stored position if bounding box can't be calculated
    return this._position;
  }
  
  /**
   * Set the position of the union operation
   * This adjusts the position of all objects in the union
   * 
   * @param {Object} newPosition - The new position object with x, y, and z properties
   */
  set position(newPosition) {
    // Calculate the difference between the new position and the current position
    const currentPosition = this.position;
    const dx = (newPosition.x || 0) - (currentPosition.x || 0);
    const dy = (newPosition.y || 0) - (currentPosition.y || 0);
    const dz = (newPosition.z || 0) - (currentPosition.z || 0);
    
    // Apply the position difference to all objects in the union
    for (const obj of this.objects) {
      obj.position = {
        x: obj.position.x + dx,
        y: obj.position.y + dy,
        z: obj.position.z + dz
      };
    }
    
    // Store the new position
    this._position = newPosition;
  }
  
  /**
   * Get the rotation of the union operation
   * This calculates the average rotation of all objects
   * 
   * @returns {Object} The rotation object with x, y, and z properties
   */
  get rotation() {
    if (this.objects.length === 0) {
      return this._rotation;
    }
    
    // Calculate the average rotation of all objects
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;
    
    for (const obj of this.objects) {
      if (obj.rotation) {
        sumX += obj.rotation.x || 0;
        sumY += obj.rotation.y || 0;
        sumZ += obj.rotation.z || 0;
        count++;
      }
    }
    
    if (count === 0) {
      return this._rotation;
    }
    
    return {
      x: sumX / count,
      y: sumY / count,
      z: sumZ / count
    };
  }
  
  /**
   * Set the rotation of the union operation
   * This adjusts the rotation of all objects in the union
   * 
   * @param {Object} newRotation - The new rotation object with x, y, and z properties
   */
  set rotation(newRotation) {
    // Calculate the difference between the new rotation and the current rotation
    const currentRotation = this.rotation;
    const dx = (newRotation.x || 0) - (currentRotation.x || 0);
    const dy = (newRotation.y || 0) - (currentRotation.y || 0);
    const dz = (newRotation.z || 0) - (currentRotation.z || 0);
    
    // Apply the rotation difference to all objects in the union
    for (const obj of this.objects) {
      obj.rotation = {
        x: (obj.rotation.x || 0) + dx,
        y: (obj.rotation.y || 0) + dy,
        z: (obj.rotation.z || 0) + dz
      };
    }
    
    // Store the new rotation
    this._rotation = newRotation;
  }
  
  /**
   * Perform the union operation on the objects
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  async performOperation() {
    // Special case: if only one object, just return it
    if (this.objects.length === 1) {
      const result = await this.objects[0].render(true);
      result.updateMatrix();
      return result;
    }
    
    // Create the BVH evaluator
    const evaluator = new Evaluator();
    
    // Track meshes and brushes for all objects
    const meshes = [];
    const brushes = [];
    
    // First, render all objects to get their meshes
    for (let i = 0; i < this.objects.length; i++) {
      const mesh = await this.objects[i].render(true);
      mesh.updateMatrix();
      meshes.push(mesh);

      console.log("111111", mesh);
      
      // Ensure the geometry has UVs before creating a brush
      const geometry = mesh.geometry.clone();
      ensureUVs(geometry);
      
      // Convert to a brush (copy geometry with current transformations applied)
      const brush = new Brush(geometry);
      brush.matrix.copy(mesh.matrix);
      brush.position.copy(mesh.position);
      brush.rotation.copy(mesh.rotation);
      brush.scale.copy(mesh.scale);
      brush.updateMatrixWorld(true);
      brushes.push(brush);
    }
    
    // Start with the first brush
    let result = brushes[0];
    
    // Union with each subsequent brush
    for (let i = 1; i < brushes.length; i++) {
      const nextBrush = brushes[i];
      result = evaluator.evaluate(result, nextBrush, ADDITION);
    }

    return result
  }
  
  /**
   * Get the bounding box of the union operation
   * This overrides the base method to calculate the bounding box correctly for unions
   * 
   * @returns {THREE.Box3|null} The bounding box of the union or null if it can't be calculated
   */
  getBoundingBox() {
    // For unions, we should compute the combined bounding box of all objects
    if (this.objects.length === 0) {
      return null;
    }
    
    // Initialize min and max values
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    
    // Track if we found at least one valid bounding box
    let foundValidBox = false;
    
    // Loop through all objects and find the overall min/max values
    for (const obj of this.objects) {
      const box = obj.getBoundingBox();
      if (box) {
        foundValidBox = true;
        
        // Update min values
        minX = Math.min(minX, box.min.x);
        minY = Math.min(minY, box.min.y);
        minZ = Math.min(minZ, box.min.z);
        
        // Update max values
        maxX = Math.max(maxX, box.max.x);
        maxY = Math.max(maxY, box.max.y);
        maxZ = Math.max(maxZ, box.max.z);
      }
    }
    
    // Create a new bounding box with the calculated min/max values
    const combinedBox = new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    );
    
    return combinedBox;
  }

  /**
   * Perform a simpler union operation on the objects
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  async performSimplerOperation() {
    const group = new THREE.Group();
    for (const obj of this.objects) {
      const mesh = await obj.render();
      group.add(mesh);
    }
    return group;
  }
  

  /**
   * Render the union operation to a THREE.js mesh
   * If performUnion is false, it'll return a group of meshes, otherwise it'll perform the union
   * It is false by default, it doesn't actually do the union by default, due to performance reasons
   * 
   * @param {boolean} [performComplexOperation=false] - Whether to perform the union operation
   * @returns {THREE.Mesh} The resulting mesh
   */
  async render(performComplexOperation = false) {
    if (!performComplexOperation) return this.performSimplerOperation();
    else return this.performOperation();
  }
}

/**
 * Class representing a subtraction operation
 */
export class SubtractOperation extends CSGOperation {
  /**
   * Perform the subtraction operation on the objects
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  async performOperation() {
    // the true parameter ensures that union objects
    // actually perform the union
    // see UnionOperation.render
    let result = await this.objects[0].render(true);
    
    for (let i = 1; i < this.objects.length; i++) {
      // the true parameter ensures that union objects
      // actually perform the union
      // see UnionOperation.render
      const nextMesh = await this.objects[i].render(true);
      
      // Make sure matrices are up to date
      result.updateMatrix();
      nextMesh.updateMatrix();
      
      // Perform CSG subtraction operation
      result = CSG.subtract(result, nextMesh);
      
      // Set a default material
      result.material = new THREE.MeshBasicMaterial();
    }
    
    return result;
  }
  
  /**
   * Render the subtraction operation to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  async render() {
    return this.performOperation();
  }
}

/**
 * Class representing an intersection operation
 */
export class IntersectOperation extends CSGOperation {
  /**
   * Perform the intersection operation on the objects
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  async performOperation() {
    // the true parameter ensures that union objects
    // actually perform the union
    // see UnionOperation.render
    let result = await this.objects[0].render(true);
    
    for (let i = 1; i < this.objects.length; i++) {
      // the true parameter ensures that union objects
      // actually perform the union
      // see UnionOperation.render
      const nextMesh = await this.objects[i].render(true);
      
      // Make sure matrices are up to date
      result.updateMatrix();
      nextMesh.updateMatrix();
      
      // Perform CSG intersection operation
      result = CSG.intersect(result, nextMesh);
      
      // Set a default material
      result.material = new THREE.MeshBasicMaterial();
    }
    
    return result;
  }
  
  /**
   * Render the intersection operation to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The resulting mesh
   */
  async render() {
    return this.performOperation();
  }
}

/**
 * Factory function to create a union operation
 * 
 * @param {...Object} objects - The objects to union
 * @returns {UnionOperation} A new UnionOperation instance
 */
export function union(...objects) {
  return new UnionOperation({ objects });
}

/**
 * Factory function to create a subtraction operation
 * 
 * @param {Object} baseObject - The base object to subtract from
 * @param {...Object} objectsToSubtract - The objects to subtract
 * @returns {SubtractOperation} A new SubtractOperation instance
 */
export function subtract(baseObject, ...objectsToSubtract) {
  return new SubtractOperation({ 
    objects: [baseObject, ...objectsToSubtract] 
  });
}

/**
 * Factory function to create an intersection operation
 * 
 * @param {...Object} objects - The objects to intersect
 * @returns {IntersectOperation} A new IntersectOperation instance
 */
export function intersect(...objects) {
  return new IntersectOperation({ objects });
}

/**
 * Factory function to create a difference operation (alias for subtract)
 * This provides compatibility with OpenSCAD naming conventions
 * 
 * @param {Object} baseObject - The base object to subtract from
 * @param {...Object} objectsToSubtract - The objects to subtract
 * @returns {SubtractOperation} A new SubtractOperation instance
 */
export function difference(baseObject, ...objectsToSubtract) {
  return subtract(baseObject, ...objectsToSubtract);
}
