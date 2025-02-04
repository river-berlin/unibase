export async function scadToJson(scadCode: string): Promise<any[]> {
  const objects: any[] = [];
  
  // Match cuboids
  const cuboidRegex = /\/\/\s*Object:\s*([\w-]+)\s*\n\s*translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*cube\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\s*,\s*center=true\);/g;
  
  // Match spheres
  const sphereRegex = /\/\/\s*Object:\s*([\w-]+)\s*\n\s*translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*sphere\(r=\s*(-?\d+\.?\d*)\s*,\s*\$fn=\d+\s*\);/g;
  
  // Match cylinders
  const cylinderRegex = /\/\/\s*Object:\s*([\w-]+)\s*\n\s*translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*cylinder\(r=\s*(-?\d+\.?\d*)\s*,\s*h=\s*(-?\d+\.?\d*)\s*,\s*center=true\s*,\s*\$fn=\d+\s*\);/g;

  // Match polyhedrons
  const polyhedronRegex = /\/\/\s*Object:\s*([\w-]+)\s*\n\s*translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*polyhedron\(\s*points\s*=\s*\[([\s\S]*?)\]\s*,\s*faces\s*=\s*\[([\s\S]*?)\]\s*,\s*convexity\s*=\s*(\d+)\s*\);/g;

  // Parse cuboids
  let match;
  while ((match = cuboidRegex.exec(scadCode)) !== null) {
    const [_, objectId, x, y, z, rx, ry, rz, width, height, depth] = match;
    objects.push({
      type: "cuboid",
      objectId,
      position: { x: Number(x), y: Number(y), z: Number(z) },
      rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
      dimensions: { width: Number(width), height: Number(height), depth: Number(depth) }
    });
  }

  // Parse spheres
  while ((match = sphereRegex.exec(scadCode)) !== null) {
    const [_, objectId, x, y, z, rx, ry, rz, radius] = match;
    objects.push({
      type: "sphere",
      objectId,
      position: { x: Number(x), y: Number(y), z: Number(z) },
      rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
      radius: Number(radius)
    });
  }

  // Parse cylinders
  while ((match = cylinderRegex.exec(scadCode)) !== null) {
    const [_, objectId, x, y, z, rx, ry, rz, radius, height] = match;
    objects.push({
      type: "cylinder",
      objectId,
      position: { x: Number(x), y: Number(y), z: Number(z) },
      rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
      radius: Number(radius),
      height: Number(height)
    });
  }

  // Parse polyhedrons
  while ((match = polyhedronRegex.exec(scadCode)) !== null) {
    const [_, objectId, x, y, z, rx, ry, rz, pointsStr, facesStr, convexity] = match;
    
    // Parse points array: convert "[-1,2,3], [4,-5,6]" into array of number triples
    const points = pointsStr.match(/\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/g)
      ?.map(p => p.slice(1, -1).split(',').map(Number)) as [number, number, number][];
    
    // Parse faces array: convert "[0,1,2], [2,3,0]" into array of number arrays
    const faces = facesStr.match(/\[[\d,\s]+\]/g)
      ?.map(f => f.slice(1, -1).split(',').map(Number)) || [];

    objects.push({
      type: "polyhedron",
      objectId,
      position: { x: Number(x), y: Number(y), z: Number(z) },
      rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
      points,
      faces,
      convexity: Number(convexity)
    });
  }

  return objects;
}