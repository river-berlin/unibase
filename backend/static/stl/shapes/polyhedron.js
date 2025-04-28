import * as THREE from "three";
import { Object3D } from "./object.js";

/**
 * Class representing a polyhedron object created from points and faces
 * Similar to OpenSCAD's polyhedron function
 */
export class Polyhedron extends Object3D {
  /**
   * Create a new polyhedron
   * 
   * @param {Object} options - The configuration options
   * @param {Object} [options.position] - The position coordinates
   * @param {number} [options.position.x=0] - The x position
   * @param {number} [options.position.y=0] - The y position
   * @param {number} [options.position.z=0] - The z position
   * @param {Object} [options.rotation] - The rotation angles in radians
   * @param {number} [options.rotation.x=0] - The x rotation
   * @param {number} [options.rotation.y=0] - The y rotation
   * @param {number} [options.rotation.z=0] - The z rotation
   * @param {Array} options.points - Array of points as [x1,y1,z1, x2,y2,z2, ...] or [[x1,y1,z1], [x2,y2,z2], ...]
   * @param {Array} options.faces - Array of faces, each face is an array of point indices
   * @param {number} [options.radius=1] - The radius/scale of the polyhedron
   * @param {number} [options.detail=0] - Level of detail (subdivision)
   * @param {boolean} [options.convexity=true] - Whether the object is convex (affects rendering)
   * @param {number|string} [options.color] - The color of the object
   * @param {string} [options.winding='reverse'] - Winding direction of faces ('forward' or 'reverse')
   */
  constructor(options = {}) {
    super(options);
    
    // Get the initial points and faces from options
    const initialPoints = options.points || [];
    const initialFaces = options.faces || [];
    
    this.radius = options.radius || 1;
    this.detail = options.detail || 0;
    this.convexity = options.convexity !== undefined ? options.convexity : true;
    this.color = options.color;
    this.rotation = options.rotation || { x: 0, y: 0, z: 0};
    this.winding = options.winding || 'reverse'; // Can be 'forward' or 'reverse'
    
    // Process points - make flat, refine, and center
    const flatPoints = Array.isArray(initialPoints[0]) ? initialPoints.flat() : initialPoints;
    // Center the points
    this.points = Polyhedron.centerPoints(flatPoints, this.radius);
    this.faces = initialFaces;
  }
  
  /**
   * Center points around the origin
   * 
   * @param {Array} points - Flat array of point coordinates [x1,y1,z1,x2,y2,z2,...]
   * @param {number} [scaleFactor=1] - Optional scale factor to apply
   * @returns {Array} Centered points
   */
  static centerPoints(points, scaleFactor = 1) {
    // If no points, return empty array
    if (!points || points.length === 0) {
      return [];
    }
    
    // Find the min and max values for each dimension
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    // Iterate through all vertices to find bounds
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i] * scaleFactor;
      const y = points[i + 1] * scaleFactor;
      const z = points[i + 2] * scaleFactor;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }
    
    // Calculate center point of the bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    // Create new centered array
    const centeredVertices = [];
    
    // Center and scale all vertices
    for (let i = 0; i < points.length; i += 3) {
      centeredVertices.push(
        (points[i] * scaleFactor) - centerX,
        (points[i + 1] * scaleFactor) - centerY,
        (points[i + 2] * scaleFactor) - centerZ
      );
    }
    
    return centeredVertices;
  }
  
  /**
   * Render the polyhedron to a THREE.js mesh
   * 
   * @returns {THREE.Mesh} The rendered THREE.js mesh
   */
  
  render() {
    // Check if points and faces are provided
    if (!this.points.length || !this.faces.length) {
      // Return an empty mesh if points or faces are missing
      return new THREE.Mesh();
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Points are already centered in the constructor
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.points, 3));
    
    // Set faces (indices)
    const indices = [];
    for (const face of this.faces) {
      // Triangulate the face if it has more than 3 vertices
      if (face.length === 3) {
        // Add face with the specified winding direction
        if (this.winding === 'forward') {
          indices.push(face[0], face[1], face[2]); // Forward winding
        } else { // reverse is the default
          indices.push(face[2], face[1], face[0]); // Reverse winding
        }
      } else if (face.length > 3) {
        // Triangulate the face (fan triangulation)
        for (let i = 1; i < face.length - 1; i++) {
          if (this.winding === 'forward') {
            indices.push(face[0], face[i], face[i + 1]); // Forward winding
          } else { // reverse is the default
            indices.push(face[i + 1], face[i], face[0]); // Reverse winding
          }
        }
      }
    }
    geometry.setIndex(indices);
    
    // Compute normals
    geometry.computeVertexNormals();
    
    // Scale the geometry if radius is not 1
    if (this.radius !== 1) {
      geometry.scale(this.radius, this.radius, this.radius);
    }
    
    // Apply detail/subdivision if needed
    if (this.detail > 0) {
      const modifier = new THREE.SubdivisionModifier(this.detail);
      modifier.modify(geometry);
    }
    
    // Create material with optional color
    const material = new THREE.MeshStandardMaterial();
    if (this.color !== undefined) {
      material.color = new THREE.Color(this.color);
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    return this.applyPositionAndRotation(mesh);
  }
}

/**
 * Factory function to create a polyhedron
 * 
 * @param {Object} options - The configuration options
 * @returns {Polyhedron} A new Polyhedron instance
 */
export function polyhedron(options) {
  return new Polyhedron(options);
}
