import { BaseObject } from '../../../../types';

/**
 * Represents a sphere object in the scene
 */
export interface SphereObject extends BaseObject {
    /** Type identifier for sphere objects */
    type: 'sphere';
    /** Radius of the sphere */
    radius: number;
} 