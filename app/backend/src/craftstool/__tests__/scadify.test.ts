import { jsonToScad, scadToStl } from '../scadify';
import { CuboidObject, SphereObject, CylinderObject, PolyhedronObject } from '../scadify';

describe('scadify', () => {
    describe('jsonToScad', () => {
        it('should convert a cuboid to SCAD format', () => {
            const cuboid: CuboidObject = {
                type: 'cuboid',
                objectId: 'test-cube-123',
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 0, y: 0, z: 0 },
                dimensions: { width: 2, height: 3, depth: 4 }
            };

            const expected = '// Object: test-cube-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) cube([2, 3, 4], center=true);';
            expect(jsonToScad([cuboid])).toBe(expected);
        });

        it('should convert a sphere to SCAD format', () => {
            const sphere: SphereObject = {
                type: 'sphere',
                objectId: 'test-sphere-123',
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 0, y: 0, z: 0 },
                radius: 5
            };

            const expected = '// Object: test-sphere-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) sphere(r=5);';
            expect(jsonToScad([sphere])).toBe(expected);
        });

        it('should convert a cylinder to SCAD format', () => {
            const cylinder: CylinderObject = {
                type: 'cylinder',
                objectId: 'test-cylinder-123',
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 0, y: 0, z: 0 },
                radius: 2,
                height: 5
            };

            const expected = '// Object: test-cylinder-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) cylinder(r=2, h=5, center=true, $fn=64);';
            expect(jsonToScad([cylinder])).toBe(expected);
        });

        it('should convert a polyhedron to SCAD format', () => {
            const polyhedron: PolyhedronObject = {
                type: 'polyhedron',
                objectId: 'test-poly-123',
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 0, y: 0, z: 0 },
                points: [[0,0,0], [1,0,0], [0,1,0], [0,0,1]],
                faces: [[0,1,2], [0,2,3], [0,3,1], [1,3,2]]
            };

            const expected = '// Object: test-poly-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) polyhedron(points = [[0, 0, 0],[1, 0, 0],[0, 1, 0],[0, 0, 1]], faces = [[0, 1, 2],[0, 2, 3],[0, 3, 1],[1, 3, 2]], convexity = 10);';
            expect(jsonToScad([polyhedron])).toBe(expected);
        });

        it('should combine multiple objects with newlines', () => {
            const cube: CuboidObject = {
                type: 'cuboid',
                objectId: 'test-cube-123',
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                dimensions: { width: 1, height: 1, depth: 1 }
            };

            const sphere: SphereObject = {
                type: 'sphere',
                objectId: 'test-sphere-123',
                position: { x: 2, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                radius: 1
            };

            const result = jsonToScad([cube, sphere]);
            const parts = result.split('\n\n');
            expect(parts).toHaveLength(2);
            expect(parts[0]).toBe('// Object: test-cube-123\ntranslate([0, 0, 0]) rotate([0, 0, 0]) cube([1, 1, 1], center=true);');
            expect(parts[1]).toBe('// Object: test-sphere-123\ntranslate([2, 0, 0]) rotate([0, 0, 0]) sphere(r=1);');
        });

        it('should throw error for unknown object type', () => {
            const invalid = {
                type: 'invalid',
                objectId: 'test-123'
            };

            expect(() => jsonToScad([invalid as any])).toThrow('Unknown object type: invalid');
        });
    });
}); 