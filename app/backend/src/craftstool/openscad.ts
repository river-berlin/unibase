import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Converts OpenSCAD text to ASCII STL using OpenSCAD CLI
 */
export async function scadToStl(scadCode: string): Promise<string> {
    if (!scadCode || scadCode.trim() === '') {
        // Return minimal valid STL for empty scene
        return `solid empty
endsolid empty`;
    }

    const tmpDir = os.tmpdir();
    const scadFile = path.join(tmpDir, `${Date.now()}.scad`);
    const stlFile = path.join(tmpDir, `${Date.now()}.stl`);

    try {
        // Write SCAD code to temporary file
        await writeFile(scadFile, scadCode);

        // Convert SCAD to STL using OpenSCAD CLI
        await execAsync(`openscad -o "${stlFile}" "${scadFile}" --export-format asciistl`);

        // Read the STL file
        const stlData = await readFile(stlFile, 'utf8');

        // Clean up temporary files
        await Promise.all([
            unlink(scadFile),
            unlink(stlFile)
        ]);

        return stlData;
    } catch (error) {
        // Clean up temporary files even if there's an error
        try {
            await Promise.all([
                unlink(scadFile),
                unlink(stlFile)
            ]);
        } catch {
            // Ignore cleanup errors
        }
        throw error;
    }
} 