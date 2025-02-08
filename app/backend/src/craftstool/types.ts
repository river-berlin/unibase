/**
 * Base interface for all 3D objects in the scene
 */
export interface BaseObject {
    /** Unique identifier for the object */
    objectId: string;
    /** Position in 3D space */
    position: {
        x: number;
        y: number;
        z: number;
    };
    /** Rotation in radians */
    rotation: {
        x: number;
        y: number;
        z: number;
    };
} 