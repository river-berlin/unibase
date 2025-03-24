import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile, readFile, unlink, copyFile, mkdir, readdir, stat } from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

async function copyLibraries(targetDir: string) {
    const libsPath = path.join(__dirname, 'openscad-libs', 'BOSL2');
    
    // Create BOSL2 directory in target
    const targetLibPath = path.join(targetDir, 'BOSL2');
    await mkdir(targetLibPath, { recursive: true });
    
    // Recursive function to copy directory contents
    async function copyDirRecursive(srcDir: string, destDir: string) {
        const entries = await readdir(srcDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);
            
            if (entry.isDirectory()) {
                // Create directory and copy its contents recursively
                await mkdir(destPath, { recursive: true });
                await copyDirRecursive(srcPath, destPath);
            } else {
                // Copy file
                await copyFile(srcPath, destPath);
            }
        }
    }
    
    // Start recursive copy from BOSL2 root
    await copyDirRecursive(libsPath, targetLibPath);
}

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
    const workDir = path.join(tmpDir, `scad_${Date.now()}`);
    await mkdir(workDir, { recursive: true });
    
    const scadFile = path.join(workDir, 'model.scad');
    const stlFile = path.join(workDir, 'model.stl');

    try {
        // Copy library files
        await copyLibraries(workDir);
        
        // Write SCAD code to temporary file
        await writeFile(scadFile, scadCode);

        // Convert SCAD to STL using OpenSCAD CLI
        await execAsync(`openscad -o "${stlFile}" "${scadFile}" --export-format asciistl`);

        // Read the STL file
        const stlData = await readFile(stlFile, 'utf8');

        // Clean up temporary directory and all its contents
        await execAsync(`rm -rf "${workDir}"`);

        return stlData;
    } catch (error) {
        // Clean up temporary directory even if there's an error
        try {
            await execAsync(`rm -rf "${workDir}"`);
        } catch {
            // Ignore cleanup errors
        }
        throw error;
    }
}