import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface ThreeRendererProps {
  projectId: string;
  scadCode: string;
}

export function ThreeRenderer({ projectId, scadCode }: ThreeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Implement OpenSCAD to Three.js conversion
    console.log('OpenSCAD code updated:', scadCode);
  }, [scadCode]);

  useEffect(() => {
    if (Platform.OS === 'web' && containerRef.current) {
      Promise.all([
        import('three'),
        import('three/examples/jsm/controls/OrbitControls')
      ]).then(([THREE, { OrbitControls }]) => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5dc);
        
        const container = containerRef.current!;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 10;

        // Add cursor styles
        renderer.domElement.style.cursor = 'grab';
        renderer.domElement.addEventListener('mousedown', () => {
          renderer.domElement.style.cursor = 'grabbing';
        });
        renderer.domElement.addEventListener('mouseup', () => {
          renderer.domElement.style.cursor = 'grab';
        });
        
        // Initial geometry (will be updated based on OpenSCAD)
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x4f46e5,
          flatShading: true,
          shininess: 100
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
        
        // Light setup
        const setupLights = () => {
          // Light at 45 degrees in X-Y plane
          const light45 = new THREE.DirectionalLight(0xffffff, 0.8);
          light45.position.set(Math.cos(Math.PI/4), Math.sin(Math.PI/4), 0);
          light45.castShadow = true;
          light45.shadow.camera.near = 0.1;
          light45.shadow.camera.far = 100;
          light45.shadow.mapSize.width = 2048;
          light45.shadow.mapSize.height = 2048;
          scene.add(light45);
          
          // Light at -45 degrees in X-Y plane
          const lightMinus45 = new THREE.DirectionalLight(0xffffff, 0.8);
          lightMinus45.position.set(Math.cos(-Math.PI/4), Math.sin(-Math.PI/4), 0);
          lightMinus45.castShadow = true;
          lightMinus45.shadow.camera.near = 0.1;
          lightMinus45.shadow.camera.far = 100;
          lightMinus45.shadow.mapSize.width = 2048;
          lightMinus45.shadow.mapSize.height = 2048;
          scene.add(lightMinus45);
          
          // Top light
          const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
          topLight.position.set(0, 5, 0);
          scene.add(topLight);

          // Front light that follows camera
          const frontLight = new THREE.SpotLight(0xffffff, 0.5);
          frontLight.angle = Math.PI / 4;
          frontLight.penumbra = 0.3;
          frontLight.decay = 1;
          frontLight.distance = 100;
          scene.add(frontLight);
          scene.add(frontLight.target);
          
          // Ambient light
          const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
          scene.add(ambientLight);

          return frontLight;
        };

        const frontLight = setupLights();
        
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 0, 0);
        
        function animate() {
          requestAnimationFrame(animate);
          
          // Update front light position to match camera
          const cameraDirection = new THREE.Vector3();
          camera.getWorldDirection(cameraDirection);
          const cameraPosition = camera.position.clone();
          frontLight.position.copy(cameraPosition);
          frontLight.target.position.copy(cameraPosition.add(cameraDirection));
          
          controls.update();
          renderer.render(scene, camera);
        }
        
        animate();
        
        function handleResize() {
          const width = container.clientWidth;
          const height = container.clientHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          
          renderer.setSize(width, height);
        }
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          container.removeChild(renderer.domElement);
          controls.dispose();
        };
      });
    }
  }, []);

  // For web platform
  if (Platform.OS === 'web') {
    return <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />;
  }

  // For mobile platforms
  const threeJsContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; background: #f5f5dc; }
          canvas { 
            width: 100%; 
            height: 100%; 
            display: block;
            cursor: grab;
          }
          canvas:active {
            cursor: grabbing;
          }
        </style>
        <script async src="https://unpkg.com/three@0.157.0/build/three.min.js"></script>
        <script async src="https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js"></script>
      </head>
      <body>
        <script>
          // Wait for Three.js to load
          window.addEventListener('load', function() {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f5dc);
            
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
              antialias: true,
              alpha: true 
            });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);

            // Add orbit controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.minDistance = 3;
            controls.maxDistance = 10;
            
            // Initial geometry (will be updated based on OpenSCAD)
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshPhongMaterial({ 
              color: 0x4f46e5,
              flatShading: true,
              shininess: 100
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add(cube);
            
            // Light setup
            const setupLights = () => {
              // Light at 45 degrees in X-Y plane
              const light45 = new THREE.DirectionalLight(0xffffff, 0.8);
              light45.position.set(Math.cos(Math.PI/4), Math.sin(Math.PI/4), 0);
              light45.castShadow = true;
              light45.shadow.camera.near = 0.1;
              light45.shadow.camera.far = 100;
              light45.shadow.mapSize.width = 2048;
              light45.shadow.mapSize.height = 2048;
              scene.add(light45);
              
              // Light at -45 degrees in X-Y plane
              const lightMinus45 = new THREE.DirectionalLight(0xffffff, 0.8);
              lightMinus45.position.set(Math.cos(-Math.PI/4), Math.sin(-Math.PI/4), 0);
              lightMinus45.castShadow = true;
              lightMinus45.shadow.camera.near = 0.1;
              lightMinus45.shadow.camera.far = 100;
              lightMinus45.shadow.mapSize.width = 2048;
              lightMinus45.shadow.mapSize.height = 2048;
              scene.add(lightMinus45);
              
              // Top light
              const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
              topLight.position.set(0, 5, 0);
              scene.add(topLight);

              // Front light that follows camera
              const frontLight = new THREE.SpotLight(0xffffff, 0.5);
              frontLight.angle = Math.PI / 4;
              frontLight.penumbra = 0.3;
              frontLight.decay = 1;
              frontLight.distance = 100;
              scene.add(frontLight);
              scene.add(frontLight.target);
              
              // Ambient light
              const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
              scene.add(ambientLight);

              return frontLight;
            };

            const frontLight = setupLights();
            
            camera.position.set(4, 4, 4);
            camera.lookAt(0, 0, 0);
            
            function animate() {
              requestAnimationFrame(animate);
              
              // Update front light position to match camera
              const cameraDirection = new THREE.Vector3();
              camera.getWorldDirection(cameraDirection);
              const cameraPosition = camera.position.clone();
              frontLight.position.copy(cameraPosition);
              frontLight.target.position.copy(cameraPosition.add(cameraDirection));
              
              controls.update();
              renderer.render(scene, camera);
            }
            
            animate();
            
            function handleResize() {
              const width = window.innerWidth;
              const height = window.innerHeight;
              
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              
              renderer.setSize(width, height);
            }
            
            window.addEventListener('resize', handleResize);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      style={{ flex: 1 }}
      source={{ html: threeJsContent }}
      onMessage={(event) => {
        console.log('Message from WebView:', event.nativeEvent.data);
      }}
    />
  );
} 