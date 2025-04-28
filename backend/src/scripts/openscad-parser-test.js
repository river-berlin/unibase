import { ParsingHelper, CodeFile } from 'openscad-parser';
import fs from 'fs';
import path from 'path';

// Example OpenSCAD code to parse
const openscadCode = `
// Example OpenSCAD code with various features
module roundedBox(size, radius) {
  x = size[0];
  y = size[1];
  z = size[2];
  
  translate([radius, radius, radius])
  minkowski() {
    cube([x-2*radius, y-2*radius, z-2*radius]);
    sphere(r=radius);
  }
}

// Variables and expressions
radius = 2;
width = 20;
height = 15;
depth = 10;

// Using the module
translate([0, 0, 0])
  roundedBox([width, height, depth], radius);

// If statement example
if (width > 15) {
  translate([width+10, 0, 0])
    cube([5, 5, 5]);
}

// For loop example  
for (i = [0:5:25]) {
  translate([i, height+10, 0])
    cylinder(h=5, r=2);
}
`;

function doParse(source) {
  const [ast, errorCollector] = ParsingHelper.parseFile(
    new CodeFile("<test>", source)
  );
  errorCollector.throwIfAny();
  return ast;
}

// Recursive function to explore the AST structure
function exploreAst(node, depth = 0, path = '') {
  const indent = '  '.repeat(depth);
  const currentPath = path ? `${path} > ${node.constructor.name}` : node.constructor.name;
  
  console.log(`${indent}${currentPath}`);
  
  // Log the properties of the node
  for (const key in node) {
    // Skip internal properties and methods
    if (key === 'tokens' || key === 'docComment' || typeof node[key] === 'function') {
      continue;
    }
    
    const value = node[key];
    
    if (value === null || value === undefined) {
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      console.log(`${indent}  ${key}: [Array with ${value.length} elements]`);
      
      // Recursively explore array elements if they're objects
      value.forEach((item, index) => {
        if (item && typeof item === 'object') {
          exploreAst(item, depth + 2, `${currentPath}.${key}[${index}]`);
        } else if (item !== null && item !== undefined) {
          console.log(`${indent}    [${index}]: ${item}`);
        }
      });
    }
    // Handle objects with nested structure
    else if (value && typeof value === 'object') {
      console.log(`${indent}  ${key}: [Object]`);
      exploreAst(value, depth + 2, `${currentPath}.${key}`);
    }
    // Handle primitive values
    else {
      console.log(`${indent}  ${key}: ${value}`);
    }
  }
}

// Parse the OpenSCAD code and get the AST
const ast = doParse(openscadCode);

console.log('\n===== FULL AST EXPLORATION =====\n');
exploreAst(ast);

// You can uncomment this to see the raw AST output too
// console.log('\n===== RAW AST =====\n');
// console.log(ast);