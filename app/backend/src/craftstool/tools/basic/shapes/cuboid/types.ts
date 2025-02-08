import { BaseObject } from '../../../../types';

/**
 * Represents a cuboid (3D rectangle) object in the scene
 */
export interface CuboidObject extends BaseObject {
    /** Type identifier for cuboid objects */
    type: 'cuboid';
    /** Dimensions of the cuboid */
    dimensions: {
        /** Width along X axis */
        width: number;
        /** Height along Y axis */
        height: number;
        /** Depth along Z axis */
        depth: number;
    };
} 