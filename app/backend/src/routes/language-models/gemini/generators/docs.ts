import fs from 'fs';
import path from 'path';

// Read primitive documentation
const docsPath = path.join(process.cwd(), 'src', 'docs', 'primitives');

export const docs = {
  index: fs.readFileSync(path.join(docsPath, 'index.md'), 'utf8'),
  cube: fs.readFileSync(path.join(docsPath, 'cube.md'), 'utf8'),
  sphere: fs.readFileSync(path.join(docsPath, 'sphere.md'), 'utf8'),
  cylinder: fs.readFileSync(path.join(docsPath, 'cylinder.md'), 'utf8'),
  polyhedron: fs.readFileSync(path.join(docsPath, 'polyhedron.md'), 'utf8')
}; 