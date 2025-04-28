/* This file is intentionally excluded from TypeScript type checking 
It's some basic functions to make writing basic threejs code easier

These helper functions provide a simplified API for creating common 3D shapes
and performing operations with them. This makes it easier to create 3D models
without having to write repetitive ThreeJS boilerplate code.
*/

// Import all shape functions from their respective files
import { cuboid, cube } from "./shapes/cuboid.js";
import { sphere } from "./shapes/sphere.js";
import { cylinder } from "./shapes/cylinder.js";
import { cone } from "./shapes/cone.js";
import { polygon } from "./shapes/polygon.js";
import { polyhedron } from "./shapes/polyhedron.js";
import { union, subtract, difference, intersect, UnionOperation, SubtractOperation, IntersectOperation, CSGOperation } from "./shapes/operations.js";
import { toStl, asStl } from "./shapes/export.js";

// Import classes for advanced usage
import { Object3D } from "./shapes/object.js";
import { Cuboid, Cube } from "./shapes/cuboid.js";
import { Sphere } from "./shapes/sphere.js";
import { Cylinder } from "./shapes/cylinder.js";
import { Cone } from "./shapes/cone.js";
import { Polygon } from "./shapes/polygon.js";
import { Polyhedron } from "./shapes/polyhedron.js";
import { lookup, linear_extrude, rotate_extrude, assert, dummy_var, str, chr, ord, is_undef, is_bool, is_num, is_string, is_list, is_object, is_vector, echo, concat } from "./compat/index.js";
import { screwThread, augerThread } from "./shapes/screws/screw.js";
import { closePoints } from "./shapes/screws/closePoints.js";
import * as THREE from "three";



// Re-export all functions to maintain the same API
export {
  // Base classes
  CSGOperation,
  Object3D,
  
  // Basic shapes - functions
  cuboid,
  cube,
  sphere,
  cylinder,
  cone,
  polygon,
  polyhedron,
  
  // Basic shapes - classes
  Cuboid,
  Cube,
  Sphere,
  Cylinder,
  Cone,
  Polygon,
  Polyhedron,
  
  // CSG operations - functions
  union,
  subtract,
  difference,
  intersect,
  
  // CSG operations - classes
  UnionOperation,
  SubtractOperation,
  IntersectOperation,
  
  // Export utilities
  toStl,
  asStl,

  // OpenSCAD compatibility functions
  screwThread,
  augerThread,
  closePoints,
  
  // OpenSCAD compatibility
  lookup,
  linear_extrude,
  rotate_extrude,
  assert,
  dummy_var,
  str,
  chr,
  ord,
  is_undef,
  is_bool,
  is_num,
  is_string,
  is_list,
  is_object,
  is_vector,
  echo,
  concat,
  
  // Three.js
  THREE
};

// All functions are now imported from their respective files in the shapes directory
