import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSG } from 'three-csg-ts';
import type { Object3D } from 'backend-js-api/src/services/ProjectService';

// Add global type declaration
declare global {
  interface Window {
    sceneRef: React.MutableRefObject<THREE.Scene | null>;
  }
}

interface ThreeRendererProps {
  projectId: string;
  objects: Object3D[];
  sceneRotation?: {
    x: number;
    y: number;
    z: number;
  };
}

export function ThreeRenderer({ projectId, objects, sceneRotation }: ThreeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const objectsRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const createPrimitive = (object: Object3D): THREE.Mesh => {
    let geometry: THREE.BufferGeometry;
    const material = new THREE.MeshPhongMaterial({
      color: object.isHollow ? 0xffffff : 0x87ceeb,
      shininess: 30,
      flatShading: true,
      transparent: object.isHollow,
      opacity: object.isHollow ? 0.5 : 1.0,
    });

    // Create the base mesh
    let mesh = createBaseMesh(object, material);

    // Apply position and rotation
    mesh.position.set(object.position.x, object.position.y, object.position.z);
    mesh.rotation.set(
      THREE.MathUtils.degToRad(object.rotation.x),
      THREE.MathUtils.degToRad(object.rotation.y),
      THREE.MathUtils.degToRad(object.rotation.z)
    );

    return mesh;
  };

  const createBaseMesh = (object: Object3D, material: THREE.Material): THREE.Mesh => {
    let geometry: THREE.BufferGeometry;

    switch (object.type) {
      case 'cube':
        let width, height, depth;
        if (Array.isArray(object.params.size)) {
          [width, height, depth] = object.params.size;
        } else {
          width = height = depth = object.params.size || 1;
        }
        geometry = new THREE.BoxGeometry(width, height, depth);
        break;

      case 'sphere':
        geometry = new THREE.SphereGeometry(object.params.radius || 1, 32, 32);
        break;

      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          object.params.radius || 1,
          object.params.radius || 1,
          object.params.height || 1,
          32
        );
        break;

      case 'polyhedron':
        if (!object.params.points || !object.params.faces) {
          throw new Error('Points and faces are required for polyhedron');
        }
        geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(object.params.points.flat());
        const indices = new Uint16Array(object.params.faces.flat());
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();
        break;

      default:
        throw new Error(`Unknown primitive type: ${object.type}`);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Apply position and rotation for CSG operations
    mesh.position.set(object.position.x, object.position.y, object.position.z);
    mesh.rotation.set(
      THREE.MathUtils.degToRad(object.rotation.x),
      THREE.MathUtils.degToRad(object.rotation.y),
      THREE.MathUtils.degToRad(object.rotation.z)
    );
    mesh.updateMatrix();

    return mesh;
  };

  const updateScene = () => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    // Remove existing objects
    if (objectsRef.current) {
      sceneRef.current.remove(objectsRef.current);
    }

    // Create new group for objects
    objectsRef.current = new THREE.Group();
    
    // Apply scene rotation if provided
    if (sceneRotation) {
      objectsRef.current.rotation.set(
        THREE.MathUtils.degToRad(sceneRotation.x),
        THREE.MathUtils.degToRad(sceneRotation.y),
        THREE.MathUtils.degToRad(sceneRotation.z)
      );
    }
    
    sceneRef.current.add(objectsRef.current);

    // Add each object to the scene
    objects.forEach(object => {
      try {
        const mesh = createPrimitive(object);
        objectsRef.current?.add(mesh);
      } catch (error) {
        console.error('Error creating primitive:', error);
      }
    });

    // Adjust camera to fit all objects
    if (objects.length > 0 && objectsRef.current) {
      const box = new THREE.Box3().setFromObject(objectsRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = 50;
      const cameraZ = maxDim / (2 * Math.tan((fov * Math.PI) / 360));
      cameraRef.current.position.set(center.x, center.y, center.z + cameraZ * 2);
      cameraRef.current.lookAt(center);
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Expose scene reference globally for complex primitives
    window.sceneRef = sceneRef;
    scene.background = new THREE.Color(0xf0f0f0);

    // Add axes helper (red = X, green = Y, blue = Z)
    const axesHelper = new THREE.AxesHelper(1000); // Large size to appear "infinite"
    scene.add(axesHelper);

    // Add floor plane
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    
    // Create a canvas for the texture
    const canvas = document.createElement('canvas');
    const size = 512; // texture size
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (context) {
      // Fill background with very light grey
      context.fillStyle = '#f5f5f5';
      context.fillRect(0, 0, size, size);

      // Draw large grid
      context.strokeStyle = '#666666';
      context.lineWidth = 2;
      const largeGridSize = size / 4; // 4x4 large grid
      for (let i = 0; i <= size; i += largeGridSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, size);
        context.stroke();
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(size, i);
        context.stroke();
      }

      // Draw smaller grid within each large square
      context.strokeStyle = '#737373';
      context.lineWidth = 1;
      const smallGridSize = largeGridSize / 4; // 4x4 small grid within each large grid
      for (let i = 0; i <= size; i += smallGridSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, size);
        context.stroke();
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(size, i);
        context.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // Repeat the texture 4x4 times

    const planeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    scene.add(plane);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Initial scene update
    updateScene();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update scene when objects change
  useEffect(() => {
    updateScene();
  }, [objects, sceneRotation]);

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>3D viewer is only available on web</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {isLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}
    </View>
  );
} 