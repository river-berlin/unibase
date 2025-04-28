// This code is rewritten from
// https://github.com/rcolyer/threads-scad/blob/master/threads.scad
import { polyhedron } from '../polyhedron.js';

export function closePoints(pointarrays) {
  // Helper function to calculate the average of points
  function recurseAvg(arr, n = 0, p = [0, 0, 0]) {
    if (n >= arr.length) return p;
    return recurseAvg(arr, n + 1, [
      p[0] + (arr[n][0] - p[0]) / (n + 1),
      p[1] + (arr[n][1] - p[1]) / (n + 1),
      p[2] + (arr[n][2] - p[2]) / (n + 1)
    ]);
  }

  const N = pointarrays.length;
  const P = pointarrays[0].length;
  const NP = N * P;
  
  // Calculate midpoints
  const midbot = recurseAvg(pointarrays[0]);
  const midtop = recurseAvg(pointarrays[N - 1]);

  // Create bottom faces
  const faces_bot = [];
  for (let i = 0; i < P; i++) {
    faces_bot.push([0, i + 1, 1 + (i + 1) % P]);
  }

  const loop_offset = 1;
  
  // Create loop faces
  const faces_loop = [];
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < P; i++) {
      // First triangle
      faces_loop.push([
        loop_offset + j * P + i,
        loop_offset + (j + 1) * P + i,
        loop_offset + (j + 1) * P + (i + 1) % P
      ]);
      
      // Second triangle
      faces_loop.push([
        loop_offset + j * P + i,
        loop_offset + (j + 1) * P + (i + 1) % P,
        loop_offset + j * P + (i + 1) % P
      ]);
    }
  }

  const top_offset = loop_offset + NP - P;
  const midtop_offset = top_offset + P;

  // Create top faces
  const faces_top = [];
  for (let i = 0; i < P; i++) {
    faces_top.push([midtop_offset, top_offset + (i + 1) % P, top_offset + i]);
  }

  // Create points array
  const points = [];
  points.push(midbot); // Add bottom center point
  
  // Add all points from the loops
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < P; i++) {
      points.push(pointarrays[j][i]);
    }
  }
  
  points.push(midtop); // Add top center point

  // Combine all faces
  const faces = [...faces_bot, ...faces_loop, ...faces_top];

  console.log('Points:', points);
  console.log('Faces:', faces); 
  
  // Return a polyhedron object
  return polyhedron({
    points: [...points.flat()],
    faces: faces
  });
}
