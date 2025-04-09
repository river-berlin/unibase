/**
 * StlGenerator.ts - A simplified utility for generating STL files from JavaScript code
 * 
 * This module creates a hidden iframe that loads JS files as ES modules via import maps
 * and generates STL data by calling the generateStls() function from index.js.
 */

import { getProjectCode } from "../../../../../client/sdk.gen";
import { NonNullableCodeObjects } from "~/app/atoms/code";

const BACKEND_SERVER_URL = "http://localhost:3002";

// Import Three.js and STLExporter via CDN
const THREE_IMPORTS = {
  "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
  "three/examples/jsm/exporters/STLExporter": "https://unpkg.com/three@0.160.0/examples/jsm/exporters/STLExporter.js",
  "three/examples/jsm/controls/OrbitControls": "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js",
  "three-csg-ts": "https://unpkg.com/three-csg-ts@3.2.0/lib/esm/index.js",
  "basics": `${BACKEND_SERVER_URL}/stl/basics.js?cache_burst=${Date.now()}`,
  "basics.js": `${BACKEND_SERVER_URL}/stl/basics.js?cache_burst=${Date.now()}`
};

/**
 * Run code in an iframe and generate STL files
 * 
 * @param projectId The project ID to load files from
 * @returns Promise resolving to the generated STL data
 */
export async function runAndGenerateStls(projectId: string): Promise<string> {
  // Get all code files for the project
  const response = await getProjectCode({path: { projectId }});
  
  if (!response.data?.objects || response.data.objects.length === 0) {
    throw new Error("No code files found for this project");
  }
  
  const codeObjects = response.data.objects as NonNullableCodeObjects;
  
  // Create a map of filename to file path
  const codeFiles = new Map<string, string>();

  codeObjects.forEach(obj => {
    if (obj.filename) {
      codeFiles.set(obj.filename, `${BACKEND_SERVER_URL}/projects/${projectId}/code/file?filename=${obj.filename}&filepath=${obj.filepath}`);
    }
  });
  
  // Check if index.js exists
  if (!codeFiles.has('index.js')) {
    throw new Error("index.js file is required but not found");
  }
  
  return new Promise((resolve, reject) => {
    // Create an iframe to run the code
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts');
    document.body.appendChild(iframe);
    
    // Set up message event listener
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'stlResult') {
        // Clean up
        window.removeEventListener('message', handleMessage);
        document.body.removeChild(iframe);
        
        // Resolve with the STL data
        resolve(event.data.stlData);
      } else if (event.data && event.data.type === 'error') {
        // Clean up
        window.removeEventListener('message', handleMessage);
        document.body.removeChild(iframe);
        
        // Reject with the error
        reject(new Error(event.data.message));
      } else if (event.data && event.data.type === 'console') {
        // Log console messages from the iframe
        if (event.data.isError) {
          console.error('Iframe:', event.data.message);
        } else {
          console.log('Iframe:', event.data.message);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Create a map of module names to their content
    const moduleMap: Record<string, string> = {};
    
    // Add each file to the module map
    codeFiles.forEach((content, filename) => {
      if (!content) return;
      
      // Strip .js extension for the import map
      const moduleName = filename.endsWith('.js') 
        ? filename.substring(0, filename.length - 3) 
        : filename;
      
      moduleMap[moduleName] = codeFiles.get(filename) || '';
      moduleMap[filename] = codeFiles.get(filename) || '';
    });
    
    // Create the import map with both external dependencies and project files
    const importMap = {
      imports: {
        ...THREE_IMPORTS,
        ...moduleMap
      }
    };
    
    // Create the iframe content
    const iframeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="importmap">
            ${JSON.stringify(importMap)}
          </script>
        </head>
        <body>
          <script type="module">
            // This module script runs last
            // Set up console logging
            const originalConsole = console;
            console = {
              log: (...args) => {
                window.parent.postMessage({
                  type: 'console',
                  message: args.map(arg => {
                    try {
                      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch {
                      return String(arg);
                    }
                  }).join(' '),
                  isError: false
                }, '*');
                originalConsole.log(...args);
              },
              error: (...args) => {
                window.parent.postMessage({
                  type: 'console',
                  message: args.map(arg => {
                    try {
                      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch {
                      return String(arg);
                    }
                  }).join(' '),
                  isError: true
                }, '*');
                originalConsole.error(...args);
              },
              warn: originalConsole.warn,
              info: originalConsole.info
            };
            
            try {
              // Import the index.js module directly from the import map
              const module = await import('index');
              
              // Check if generateStls function exists
              if (typeof module.generateStls !== 'function') {
                throw new Error("index.js must export a generateStls() function");
              }
              
              // Call the generateStls function
              const stlData = await module.generateStls();
              
              // Send the result back to the parent
              window.parent.postMessage({
                type: 'stlResult',
                stlData
              }, '*');
            } catch (error) {
              // Send any errors back to the parent
              window.parent.postMessage({
                type: 'error',
                message: error.message || 'Unknown error'
              }, '*');
            }
          </script>
        </body>
      </html>
    `;
    
    // Set the iframe content
    iframe.srcdoc = iframeContent;
  });
}
