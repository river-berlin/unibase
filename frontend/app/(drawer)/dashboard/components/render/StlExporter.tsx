/**
 * StlExporter.ts - A utility for generating STL files from JavaScript code using Three.js
 * 
 * This module creates a hidden iframe in the document that runs Three.js and converts
 * JavaScript code into STL data. It handles all the communication with the iframe.
 */

// Type for code files
type CodeFile = { 
  id?: string; 
  object?: string; 
  project_id?: string;
  created_at?: string;
  updated_at?: string;
};

// Module state
let iframe: HTMLIFrameElement | null = null;
let iframeLoaded = false;
let pendingCodeFiles: CodeFile[] = [];
let stlGeneratedCallback: ((stlData: string) => void) | null = null;

/**
 * Initialize the StlExporter by creating the hidden iframe
 * @param callback Function to call when STL data is generated
 */
export function initStlExporter(callback: (stlData: string) => void): void {
  // Set the callback
  stlGeneratedCallback = callback;
  
  // Create the iframe if it doesn't exist
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts allow-modals allow-same-origin');
    iframe.srcdoc = iframeContent;
    document.body.appendChild(iframe);
    
    // Set up message listener for iframe communication
    window.addEventListener('message', handleMessage);
  }
  
  // Process any pending code files once the iframe is loaded
  if (iframeLoaded && pendingCodeFiles.length > 0) {
    executeCodeForStl(pendingCodeFiles);
    pendingCodeFiles = [];
  }
}

/**
 * Handle messages from the iframe
 */
function handleMessage(event: MessageEvent): void {
  if (event.data) {
    if (event.data.type === 'stlData' && event.data.stl && stlGeneratedCallback) {
      // Pass STL data to callback
      stlGeneratedCallback(event.data.stl);
    } else if (event.data.type === 'iframeLoaded') {
      iframeLoaded = true;
      
      // Process any pending code files
      if (pendingCodeFiles.length > 0) {
        executeCodeForStl(pendingCodeFiles);
        pendingCodeFiles = [];
      }
    } else if (event.data.type === 'console') {
      // Handle console messages from the iframe
      if (event.data.isError) {
        console.error('Iframe console:', ...event.data.args);
      } else {
        console.log('Iframe console:', ...event.data.args);
      }
    } else if (event.data.type === 'error') {
      console.error('StlExporter error:', event.data.error);
    }
  }
}

/**
 * Generate an STL from code files
 * @param codeFiles Array of code files to execute
 */
export function generateStl(codeFiles: CodeFile[]): void {
  // Filter out any code files without object content
  const validCodeFiles = codeFiles.filter(file => file && file.object);
  if (!iframe) {
    // Store code files to process once iframe is created
    pendingCodeFiles = validCodeFiles;
    return;
  }
  
  if (iframeLoaded) {
    executeCodeForStl(validCodeFiles);
  } else {
    // Store code files to process once iframe is loaded
    pendingCodeFiles = validCodeFiles;
  }
}

/**
 * Execute code in the iframe to generate an STL
 */
function executeCodeForStl(codeFiles: CodeFile[]): void {
  if (iframe && iframeLoaded) {
    iframe.contentWindow?.postMessage({
      type: 'executeCode',
      code: codeFiles
    }, '*');
  }
}

// The iframe HTML content - only focused on STL generation
const iframeContent = `
  <!DOCTYPE html>
  <html>
      <head>
        <script type="importmap">
        {
          "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/examples/jsm/controls/OrbitControls": "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js",
            "three/examples/jsm/exporters/STLExporter": "https://unpkg.com/three@0.160.0/examples/jsm/exporters/STLExporter.js"
          }
        }
        </script>
        <script type="module">
          import * as THREE from 'three';
          import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
          import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
          
          // Expose THREE and necessary modules to window for access
          window.THREE = THREE;
          window.OrbitControls = OrbitControls;
          window.STLExporter = STLExporter;
        </script>
      </head>
      <body>
        <script type="module">
          // Create a safe environment for code execution
          const safeWindow = {
            THREE: window.THREE,
            OrbitControls: window.OrbitControls,
            STLExporter: window.STLExporter,
            console: {
              log: (...args) => window.parent.postMessage({ type: 'console', args }, '*'),
              error: (...args) => window.parent.postMessage({ type: 'console', args, isError: true }, '*'),
            },
          };

          // Function to generate an STL from a three.js scene with transforms applied
          function generateStlFromScene(scene) {
            try {
              console.log("hiiiiiiiii!")
              // Create a new scene for the export
              const exportScene = new THREE.Scene();
              
              // Process all meshes in the scene
              scene.traverse((object) => {
                if (object.isMesh) {
                  // Clone the mesh and its geometry
                  const clonedMesh = object.clone();
                  const geometry = clonedMesh.geometry.clone();
                  
                  // Make sure world matrix is up to date
                  object.updateMatrixWorld(true);
                  
                  // Apply the world matrix to the geometry to bake in all transforms
                  geometry.applyMatrix4(object.matrixWorld);
                  
                  // Create a new mesh with the transformed geometry
                  const exportMesh = new THREE.Mesh(
                    geometry,
                    clonedMesh.material
                  );
                  
                  // Reset transforms since they're now baked into the geometry
                  exportMesh.position.set(0, 0, 0);
                  exportMesh.rotation.set(0, 0, 0);
                  exportMesh.scale.set(1, 1, 1);
                  
                  // Add to the export scene
                  exportScene.add(exportMesh);
                }
              });
              
              // Create STL exporter
              const exporter = new window.STLExporter();
              
              // Export as ASCII STL
              const stlString = exporter.parse(exportScene, { binary: false });
              
              // Send the STL data back to parent
              window.parent.postMessage({ 
                type: 'stlData', 
                stl: stlString 
              }, '*');
              
              console.log('STL generated with transforms applied');
              
              return stlString;
            } catch (error) {
              console.error('Error generating STL:', error);
              window.parent.postMessage({ 
                type: 'error', 
                error: \`STL export error: \${error.message}\` 
              }, '*');
              return null;
            }
          }

          // Function to load and execute code modules
          async function loadModules(codeFiles) {
            try {
              // Create a temporary scene for generating STL
              const tempScene = new THREE.Scene();
              
              // Add some basic lighting to the scene
              const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
              tempScene.add(ambientLight);
              
              const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
              directionalLight.position.set(1, 1, 1);
              tempScene.add(directionalLight);
              
              for (let i = 0; i < codeFiles.length; i++) {
                const code = codeFiles[i];
                const result = await executeCode(code.object, tempScene);
                
                if (result && result.error) {
                  window.parent.postMessage({ 
                    type: 'error', 
                    error: result.error 
                  }, '*');
                }
              }
              
              // Generate and return STL from the scene
              generateStlFromScene(tempScene);
              
              return { success: true };
            } catch (error) {
              window.parent.postMessage({ 
                type: 'error', 
                error: \`Error processing code: \${error.message}\` 
              }, '*');
              return { success: false, error: error.message };
            }
          }
          
          // Execute a piece of code
          async function executeCode(code, scene) {
            try {
              // Create a function to execute the code with access to THREE and scene
              const fn = new Function('THREE', 'scene', \`
                try {
                  \${code}
                  return { success: true };
                } catch (e) {
                  return { success: false, error: e.message };
                }
              \`);
              
              // Execute the code with dependencies
              return fn(window.THREE, scene);
            } catch (error) {
              return { success: false, error: error.message };
            }
          }

          // Listen for messages from the parent window
          window.addEventListener('message', async (event) => {
            if (event.data.type === 'executeCode') {
              const result = await loadModules(event.data.code);
              
              if (!result.success) {
                window.parent.postMessage({ 
                  type: 'error', 
                  error: result.error || 'Error executing code' 
                }, '*');
              }
            }
          });

          // Signal that the iframe is fully loaded
          window.parent.postMessage({ type: 'iframeLoaded' }, '*');
        </script>
      </body>
    </html>
  `;

/**
 * Clean up the StlExporter
 */
export function cleanupStlExporter(): void {
  if (iframe) {
    document.body.removeChild(iframe);
    iframe = null;
  }
  window.removeEventListener('message', handleMessage);
  iframeLoaded = false;
  pendingCodeFiles = [];
  stlGeneratedCallback = null;
}
