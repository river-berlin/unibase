import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, ActivityIndicator, Text } from 'react-native';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

interface ThreeRendererProps {
  stlData: string | null;
}

export function ThreeRenderer({ stlData }: ThreeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  
  // Add refs to store camera and controls state
  const cameraStateRef = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);

  const loadSTL = (stlText: string) => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    // Store current camera and controls state before loading new STL
    if (meshRef.current) {
      cameraStateRef.current = {
        position: cameraRef.current.position.clone(),
        target: controlsRef.current.target.clone()
      };
    }

    // Remove existing mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current = null;
    }

    // Don't try to load if STL is empty
    if (stlText.trim() === '') {
      return;
    }

    // Create STL loader
    const loader = new STLLoader();
    
    // Load STL from text
    const geometry = loader.parse(stlText);
    
    // Create mesh
    const material = new THREE.MeshPhongMaterial({
      color: 0x87ceeb,
      shininess: 30,
      flatShading: true
    });
    
    meshRef.current = new THREE.Mesh(geometry, material);
    meshRef.current.castShadow = true;
    meshRef.current.receiveShadow = true;
    
    // Add to scene
    sceneRef.current.add(meshRef.current);

    // Adjust camera to fit the mesh only if no previous state exists
    if (!cameraStateRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = 50;
      const cameraZ = maxDim / (2 * Math.tan((fov * Math.PI) / 360));
      cameraRef.current.position.set(center.x, center.y, center.z + cameraZ * 2);
      cameraRef.current.lookAt(center);
      controlsRef.current.target.copy(center);
    } else {
      // Restore previous camera and controls state
      cameraRef.current.position.copy(cameraStateRef.current.position);
      controlsRef.current.target.copy(cameraStateRef.current.target);
    }
    
    controlsRef.current.update();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff);

    // Add floor plane
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
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
      30,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(50, 50, 50);
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

    // Load STL if available
    if (stlData) {
      loadSTL(stlData);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update when STL data changes
  useEffect(() => {
    if (stlData) {
      loadSTL(stlData);
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
      {isLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#dbdad6" />
        </View>
      )}
    </View>
  );
} 