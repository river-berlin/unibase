import { declarationAndFunction as addCuboid } from './basic/add_cuboid';
import { declarationAndFunction as addSphere } from './basic/add_sphere';
import { declarationAndFunction as addCylinder } from './basic/add_cylinder';
import { declarationAndFunction as placeObject } from './basic/place_object';
import { declarationAndFunction as specifyRotation } from './basic/specify_rotation';
import { declarationAndFunction as removeObject } from './basic/remove_object';

// these are the most common tools that will be present by default
// in the future there will be a search function to find tools
// so more complex tools used

export const basicDeclarationsAndFunctions = [
    addCuboid,
    addSphere,
    addCylinder,
    placeObject,
    specifyRotation,
    removeObject
]