import { BaseObject } from '../../../../types';

/**
 * Represents a cylinder object in the scene
 */
export interface CylinderObject extends BaseObject {
    /** Type identifier for cylinder objects */
    type: 'cylinder';
    /** Radius of the cylinder */
    radius: number;
    /** Height of the cylinder */
    height: number;
} 