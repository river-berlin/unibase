import * as THREE from 'three';
import { polygon } from '../shapes/polygon.js';
import { polyhedron } from '../shapes/polyhedron.js';

/**
 * Linear extrusion of a 2D shape along the z-axis
 * Compatible with OpenSCAD's linear_extrude() function
 * 
 * @param {Object} options - Extrusion options
 * @param {number} [options.height=1] - Height of extrusion
 * @param {boolean} [options.center=false] - Whether to center the extrusion along the z-axis
 * @param {number} [options.convexity=10] - Convexity hint (not used in this implementation)
 * @param {number} [options.twist=0] - Degrees to twist the shape over the extrusion height
 * @param {number} [options.slices] - Number of intermediate points along the height (calculated automatically if not specified)
 * @param {number} [options.scale=1] - Scale factor at the top of extrusion (can be a number or [x,y] vector)
 * @param {Object} [options.position] - Position of the extruded object
 * @param {number} [options.position.x=0] - X position
 * @param {number} [options.position.y=0] - Y position
 * @param {number} [options.position.z=0] - Z position
 * @param {Object} [options.rotation] - Rotation of the extruded object
 * @param {number} [options.rotation.x=0] - X rotation in radians
 * @param {number} [options.rotation.y=0] - Y rotation in radians
 * @param {number} [options.rotation.z=0] - Z rotation in radians
 * @param {number|string} [options.color] - Color of the extruded object
 * @param {Function|Object} [options.shape] - Either a 2D shape object or a function that returns one
 * @returns {Object} The extruded 3D object
 */
function linear_extrude(options = {}) {
  // Support legacy form (shape as separate parameter)
  let shape = arguments[1];
  if (shape !== undefined) {
    console.warn('Using shape as a separate parameter is deprecated. Please pass it as options.shape');
    options.shape = shape;
  }
  
  // Handle both forms of calling: pure shape object without options
  if (typeof options === 'function' || (typeof options === 'object' && options.points !== undefined && !options.hasOwnProperty('height') && !options.hasOwnProperty('shape'))) {
    options = { shape: options };
  }

  // Get the shape - either directly or by calling the function
  const shapeFunc = options.shape;
  const shapeObj = typeof shapeFunc === 'function' ? shapeFunc() : shapeFunc;
  
  // Extract options with defaults
  const height = options.height || 1;
  const center = options.center || false;
  const twist = options.twist || 0;
  const scale = options.scale !== undefined ? options.scale : 1;
  
  // Determine number of slices based on twist angle
  const slices = options.slices || Math.max(2, Math.ceil(Math.abs(twist) / 30) + 1);
  
  // Convert scale to vector if it's a number
  const scaleVector = Array.isArray(scale) ? { x: scale[0], y: scale[1] } : { x: scale, y: scale };
  
  // Get the points and paths from the 2D shape
  const points = shapeObj.points || [];
  const paths = shapeObj.paths || [];
  
  if (points.length === 0 || paths.length === 0) {
    console.error('Cannot extrude empty shape');
    return null;
  }

  // Prepare arrays for the 3D vertices and faces
  const vertices = [];
  const faces = [];
  
  // Create slices
  for (let i = 0; i <= slices; i++) {
    const t = i / slices; // Parameter from 0 to 1
    const z = center ? -height/2 + height * t : height * t;
    const angle = twist * t * (Math.PI / 180); // Convert degrees to radians
    const currentScale = {
      x: 1 + (scaleVector.x - 1) * t,
      y: 1 + (scaleVector.y - 1) * t
    };
    
    // Transform each point in the slice
    for (let j = 0; j < points.length; j += 2) {
      const x = points[j];
      const y = points[j + 1];
      
      // Apply scaling
      const scaledX = x * currentScale.x;
      const scaledY = y * currentScale.y;
      
      // Apply twist rotation
      const rotatedX = scaledX * Math.cos(angle) - scaledY * Math.sin(angle);
      const rotatedY = scaledX * Math.sin(angle) + scaledY * Math.cos(angle);
      
      // Add the 3D vertex
      vertices.push(rotatedX, rotatedY, z);
    }
  }
  
  // Create faces by connecting adjacent slices
  const pointsPerSlice = points.length / 2;
  
  for (let i = 0; i < slices; i++) {
    for (const path of paths) {
      for (let j = 0; j < path.length; j++) {
        const curr = path[j];
        const next = path[(j + 1) % path.length];
        
        const i0 = i * pointsPerSlice + curr;
        const i1 = i * pointsPerSlice + next;
        const i2 = (i + 1) * pointsPerSlice + next;
        const i3 = (i + 1) * pointsPerSlice + curr;
        
        // Add two triangular faces for each quad with correct counterclockwise winding
        // We need to handle special cases when scaling is involved
        // When scale is 1 (no scaling) or scale > 1 (growing), use standard winding
        // When scale < 1 (shrinking), we need to use the previous winding
        if (scaleVector.x < 1 && scaleVector.y < 1) {
          // Original winding for shrinking shapes
          faces.push([i0, i1, i2]);
          faces.push([i0, i2, i3]);
        } else {
          // New winding for growing shapes
          faces.push([i0, i3, i2]);
          faces.push([i0, i2, i1]);
        }
      }
    }
  }
  
  // Create top and bottom caps if the shape is closed
  for (const path of paths) {
    if (path.length >= 3) {
      // Create triangulated bottom face
      const bottomFace = [];
      for (let i = 0; i < path.length; i++) {
        if (scaleVector.x < 1 && scaleVector.y < 1) {
          bottomFace.unshift(path[i]);
        } else {
          bottomFace.push(path[i]);
        }
      }
      faces.push(bottomFace);
      
      // Create triangulated top face (reverse winding)
      const topFace = [];
      for (let i = path.length - 1; i >= 0; i--) {
        if (scaleVector.x < 1 && scaleVector.y < 1) {
          topFace.unshift(path[i] + pointsPerSlice * slices);
        } else {
          topFace.push(path[i] + pointsPerSlice * slices);
        }
      }
      faces.push(topFace);
    }
  }
  
  // Create the polyhedron with all options
  return polyhedron({
    points: vertices,
    faces: faces,
    convexity: options.convexity || 10,
    position: options.position,
    rotation: options.rotation,
    color: options.color,
    winding: options.winding,
    detail: options.detail,
    radius: options.radius
  });
}

export { linear_extrude };
