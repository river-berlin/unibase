import { tool } from './tool';
import { func } from './function';
import { jsonToScad } from './jsonToScad';
import { scadToJson } from './scadToJson';
export { CuboidObject } from './types';

export const details = {
    declaration: tool,
    function: func,
    jsonToScad,
    scadToJson
}; 

export { tool as declaration, func as function, jsonToScad, scadToJson };