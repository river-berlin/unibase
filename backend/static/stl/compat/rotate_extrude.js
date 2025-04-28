import { polyhedron } from '../shapes/polyhedron.js';

/**
 * Rotational extrusion of a 2D shape around the z-axis
 * Compatible with OpenSCAD's rotate_extrude() function
 * 
 * @param {Object} options - Extrusion options
 * @param {number} [options.angle=360] - Angle of revolution in degrees
 * @param {number} [options.convexity=10] - Convexity hint (not used in this implementation)
 * @param {number} [options.segments] - Number of segments for the revolution (calculated automatically if not specified)
 * @param {Object} [options.position] - Position of the extruded object
 * @param {number} [options.position.x=0] - X position
 * @param {number} [options.position.y=0] - Y position
 * @param {number} [options.position.z=0] - Z position
 * @param {Object} [options.rotation] - Rotation of the extruded object
 * @param {number} [options.rotation.x=0] - X rotation in radians
 * @param {number} [options.rotation.y=0] - Y rotation in radians
 * @param {number} [options.rotation.z=0] - Z rotation in radians
 * @param {number|string} [options.color] - Color of the extruded object
 * @param {number} [options.winding] - Winding direction of faces ('forward' or 'reverse')
 * @param {number} [options.detail] - Level of detail for subdivision
 * @param {number} [options.radius] - Radius/scale of the resulting polyhedron
 * @param {Function|Object} [options.shape] - Either a 2D shape object or a function that returns one
 * @returns {Object} The rotationally extruded 3D object
 */
function rotate_extrude(options = {}) {
  // Support legacy form (shape as separate parameter)
  let shape = arguments[1];
  if (shape !== undefined) {
    console.warn('Using shape as a separate parameter is deprecated. Please pass it as options.shape');
    options.shape = shape;
  }
  
  // Handle both forms of calling: pure shape object without options
  if (typeof options === 'function' || (typeof options === 'object' && options.points !== undefined && !options.hasOwnProperty('angle') && !options.hasOwnProperty('shape'))) {
    options = { shape: options };
  }

  // Get the shape - either directly or by calling the function
  const shapeFunc = options.shape;
  const shapeObj = typeof shapeFunc === 'function' ? shapeFunc() : shapeFunc;
  
  // Extract options with defaults
  const angle = options.angle !== undefined ? options.angle : 360;
  const angleRad = angle * (Math.PI / 180); // Convert to radians
  
  // Determine number of segments based on angle
  const segments = options.segments || Math.max(3, Math.ceil(Math.abs(angle) / 10));
  
  // Get the points and paths from the 2D shape
  const points = shapeObj.points || [];
  const paths = shapeObj.paths || [];
  
  if (points.length === 0 || paths.length === 0) {
    console.error('Cannot extrude empty shape');
    return null;
  }

  // Check that all points have positive X coordinates (rotational axis is at x=0)
  const minX = Math.min(...points.filter((_, i) => i % 2 === 0));
  if (minX < 0) {
    console.warn('Rotate extrude with negative X coordinates may produce unexpected results');
  }

  // Prepare arrays for the 3D vertices and faces
  const vertices = [];
  const faces = [];
  
  // Create points for each segment of the revolution
  const pointsPerSlice = points.length / 2;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // Parameter from 0 to 1
    const currentAngle = angleRad * t;
    
    // Transform each point in the slice
    for (let j = 0; j < points.length; j += 2) {
      const x = points[j];
      const y = points[j + 1];
      
      // Rotate point around Z axis
      const worldX = x * Math.cos(currentAngle);
      const worldY = x * Math.sin(currentAngle);
      const worldZ = y;
      
      // Add the 3D vertex
      vertices.push(worldX, worldY, worldZ);
    }
  }
  
  // Create faces by connecting adjacent slices
  for (let i = 0; i < segments; i++) {
    for (const path of paths) {
      for (let j = 0; j < path.length; j++) {
        const curr = path[j];
        const next = path[(j + 1) % path.length];
        
        const i0 = i * pointsPerSlice + curr;
        const i1 = i * pointsPerSlice + next;
        const i2 = (i + 1) * pointsPerSlice + next;
        const i3 = (i + 1) * pointsPerSlice + curr;
        
        // Add two triangular faces for each quad (with proper winding)
        faces.push([i0, i1, i2]);
        faces.push([i0, i2, i3]);
      }
    }
  }
  
  // If the rotation is not a full 360 degrees, add cap faces at the start and end
  if (angle < 360) {
    // Add start cap (slice 0)
    for (const path of paths) {
      if (path.length >= 3) {
        const startCapFace = [];
        for (let i = path.length - 1; i >= 0; i--) {
          startCapFace.push(path[i]);
        }
        faces.push(startCapFace);
      }
    }
    
    // Add end cap (last slice)
    for (const path of paths) {
      if (path.length >= 3) {
        const endCapFace = [];
        for (let i = 0; i < path.length; i++) {
          endCapFace.push(path[i] + pointsPerSlice * segments);
        }
        faces.push(endCapFace);
      }
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

export { rotate_extrude };
