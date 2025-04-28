import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, ActivityIndicator, Text } from 'react-native';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { setupLighting } from './setupLighting';
import { setupCamera, updateCameraAspect, getRenderImage, CameraState } from './setupCamera';
import { setupFloor, loadSTLObject } from './setupObject';
import { setupCoordinateArrows } from './setupCoordinateArrows';
import { useSceneImage, useStlData } from '../../../../../app/atoms';
// STL generation is now handled in the Editor component

interface ThreeRendererProps {
  setScene: (sceneImage: string) => void;
}

export function ThreeRenderer({ setScene }: ThreeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | THREE.Group | null>(null);
  const cameraStateRef = useRef<CameraState | null>(null);
  const { setImage } = useSceneImage();
  const { stlData } = useStlData();


  // Handle container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          const { width, height } = entry.contentRect;
          setContainerSize({ width, height });
          
          if (cameraRef.current && rendererRef.current) {
            updateCameraAspect(cameraRef.current, rendererRef.current, width, height);
          }
        }, 100);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Initial setup
  useEffect(() => {
    if (!containerRef.current || !containerSize.width || !containerSize.height) return;

    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff);

    
    setupFloor(scene);
    setupLighting(scene);

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerSize.width, containerSize.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Set up camera and controls
    const { camera, controls } = setupCamera(containerSize.width, containerSize.height, renderer);
    cameraRef.current = camera;
    controlsRef.current = controls;

    // Set up coordinate arrows
    const updateArrows = setupCoordinateArrows(scene, camera, renderer);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      updateArrows(); // Update arrows position
    };
    animate();

    // Capture scene every second
    const captureInterval = setInterval(() => {
      if (renderer && scene && camera) {
        const image = getRenderImage(renderer, scene, camera);
        setScene(image);
        setImage(image); // Also update the scene image atom
      }
    }, 500);

    // Load STL if available
    if (stlData) {
      const { mesh, cameraState } = loadSTLObject(
        stlData,
        scene,
        camera,
        controls,
        meshRef.current,
        cameraStateRef.current
      );
      meshRef.current = mesh;
      cameraStateRef.current = cameraState;
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(captureInterval);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [containerSize.width, containerSize.height]);

  // Update when STL data changes
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    if (stlData) {
      const { mesh, cameraState } = loadSTLObject(
        stlData,
        sceneRef.current,
        cameraRef.current,
        controlsRef.current,
        meshRef.current,
        cameraStateRef.current
      );
      meshRef.current = mesh;
      cameraStateRef.current = cameraState;
      setIsLoading(false);
    } else if (sceneRef.current && meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current = null;
    }
  }, [stlData]);

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
      {/* StlExporter is now a utility that runs in the background */}
      {isLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#dbdad6" />
        </View>
      )}
    </View>
  );
} 