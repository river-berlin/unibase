import { scadToJson } from '../scadToJson';

// Simple ID generator for tests that mimics the 3-word format
function generateTestId(index: number): string {
    return `word1-word2-word${index}`;
}

describe('scadToJson', () => {
    it('should parse a cuboid from SCAD', async () => {
        const scad = '// Object: test-cube-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) cube([2, 3, 4], center=true);';
        const result = await scadToJson(scad);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            type: 'cuboid',
            objectId: 'test-cube-123',
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            dimensions: { width: 2, height: 3, depth: 4 }
        });
    });

    it('should parse a sphere from SCAD', async () => {
        const scad = '// Object: test-sphere-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) sphere(r=5);';
        const result = await scadToJson(scad);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            type: 'sphere',
            objectId: 'test-sphere-123',
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            radius: 5
        });
    });

    it('should parse a cylinder from SCAD', async () => {
        const scad = '// Object: test-cylinder-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) cylinder(r=2, h=5, center=true, $fn=64);';
        const result = await scadToJson(scad);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            type: 'cylinder',
            objectId: 'test-cylinder-123',
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            radius: 2,
            height: 5
        });
    });

    it('should parse a polyhedron from SCAD', async () => {
        const scad = '// Object: test-poly-123\ntranslate([1, 2, 3]) rotate([0, 0, 0]) polyhedron(points = [[0, 0, 0],[1, 0, 0],[0, 1, 0],[0, 0, 1]], faces = [[0, 1, 2],[0, 2, 3],[0, 3, 1],[1, 3, 2]], convexity = 10);';
        const result = await scadToJson(scad);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            type: 'polyhedron',
            objectId: 'test-poly-123',
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            points: [[0,0,0], [1,0,0], [0,1,0], [0,0,1]],
            faces: [[0,1,2], [0,2,3], [0,3,1], [1,3,2]],
            convexity: 10
        });
    });

    it('should parse multiple objects from SCAD', async () => {
        const scad = `// Object: test-cube-123\ntranslate([0, 0, 0]) rotate([0, 0, 0]) cube([1, 1, 1], center=true);

// Object: test-sphere-123\ntranslate([2, 0, 0]) rotate([0, 0, 0]) sphere(r=1);`;
        
        const result = await scadToJson(scad);
        
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe('cuboid');
        expect(result[1].type).toBe('sphere');
        expect(result[0].objectId).toBe('test-cube-123');
        expect(result[1].objectId).toBe('test-sphere-123');
    });

    it('should handle empty input', async () => {
        const result = await scadToJson('');
        expect(result).toEqual([]);
    });

    it('should handle whitespace variations', async () => {
        // Tests parsing when there are no spaces between array values [0,0,0] vs [0, 0, 0]
        const scad = '// Object: test-cube-123\ntranslate([0,0,0]) rotate([0,0,0]) cube([1,1,1], center=true);';
        const result = await scadToJson(scad);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            type: 'cuboid',
            objectId: 'test-cube-123',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            dimensions: { width: 1, height: 1, depth: 1 }
        });
    });

    it('should handle large files with many objects', async () => {
        // Generate a large SCAD file with 1000 objects
        const objects = Array.from({ length: 1000 }, (_, i) => {
            const x = i * 2;
            const id = generateTestId(i);
            
            return `// Object: ${id}\ntranslate([${x}, 0, 0]) rotate([0, 0, 0]) cube([1, 1, 1], center=true);`;
        }).join('\n\n');

        const result = await scadToJson(objects);
        
        expect(result).toHaveLength(1000);
        
        // Verify first object's structure and ID format
        expect(result[0]).toMatchObject({
            type: 'cuboid',
            objectId: 'word1-word2-word0',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            dimensions: { width: 1, height: 1, depth: 1 }
        });

        // Verify middle object's position and structure
        expect(result[500]).toMatchObject({
            type: 'cuboid',
            objectId: 'word1-word2-word500',
            position: { x: 1000, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            dimensions: { width: 1, height: 1, depth: 1 }
        });

        // Verify last object's position and structure
        expect(result[999]).toMatchObject({
            type: 'cuboid',
            objectId: 'word1-word2-word999',
            position: { x: 1998, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            dimensions: { width: 1, height: 1, depth: 1 }
        });
    });
}); 