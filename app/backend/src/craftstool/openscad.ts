import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile, readFile, unlink, copyFile } from 'fs/promises';
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

/**
 * Converts OpenSCAD code to a base64 encoded PNG image
 */
export async function scadToPng(scadCode: string): Promise<string> {
    if (!scadCode || scadCode.trim() === '') {
        return ''; // Return empty string for empty scene
    }

    const tmpDir = os.tmpdir();
    const timestamp = Date.now();
    const scadFile = path.join(tmpDir, `${timestamp}.scad`);
    const pngFile = path.join(tmpDir, `${timestamp}.png`);

    // Debug files
    const debugScadFile = path.join('.', 'debug_latest.scad');
    const debugPngFile = path.join('.', 'debug_latest.png');

    try {
        // Write SCAD code to temporary file
        await writeFile(scadFile, scadCode);

        // Save a copy for debugging
        await copyFile(scadFile, debugScadFile);

        // Convert SCAD to PNG using OpenSCAD CLI
        // Add some default camera and render settings for better visualization
        const cmd = `openscad -o "${pngFile}" "${scadFile}" --camera=0,0,0,0,0,0,50 --colorscheme Tomorrow --imgsize=800,600`;
        console.log('Executing OpenSCAD command:', cmd);
        
        const { stdout, stderr } = await execAsync(cmd);
        if (stderr) {
            console.log('OpenSCAD stderr:', stderr);
        }
        if (stdout) {
            console.log('OpenSCAD stdout:', stdout);
        }

        // Read the PNG file and convert to base64
        const pngData = await readFile(pngFile);
        const base64Image = pngData.toString('base64');

        // Save a copy of the PNG for debugging
        await copyFile(pngFile, debugPngFile);

        // Clean up temporary files (but keep debug files)
        await Promise.all([
            unlink(scadFile),
            unlink(pngFile)
        ]);

        console.log('Debug files saved at:', {
            scad: debugScadFile,
            png: debugPngFile
        });

        return base64Image;
    } catch (error) {
        // Clean up temporary files even if there's an error
        try {
            await Promise.all([
                unlink(scadFile),
                unlink(pngFile)
            ]);
        } catch {
            // Ignore cleanup errors
        }
        throw error;
    }
} 