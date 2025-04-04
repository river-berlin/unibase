import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { CameraState } from './setupCamera';

export function setupFloor(scene: THREE.Scene) {
  const planeGeometry = new THREE.PlaneGeometry(50, 50);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
  return plane;
}

export function loadSTLObject(
  stlText: string,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: THREE.OrbitControls,
  previousMesh: THREE.Mesh | null,
  previousCameraState: CameraState | null
): { mesh: THREE.Mesh | null; cameraState: CameraState | null } {
  // Remove existing mesh
  if (previousMesh) {
    scene.remove(previousMesh);
  }

  if (stlText.trim() === '') {
    const emptyGeometry = new THREE.BufferGeometry();
    const emptyMesh = new THREE.Mesh(emptyGeometry, new THREE.MeshBasicMaterial());
    return { mesh: emptyMesh, cameraState: null };
  }

  const loader = new STLLoader();
  let geometry: THREE.BufferGeometry | null = null;
  try {
    geometry = loader.parse(stlText);
  } catch (error) {
    console.error('Error loading STL:', error);
    const emptyGeometry = new THREE.BufferGeometry();
    const emptyMesh = new THREE.Mesh(emptyGeometry, new THREE.MeshBasicMaterial());
    return { mesh: emptyMesh, cameraState: null };
  }
  // Center the geometry
  geometry.center();
  
  const material = new THREE.MeshPhongMaterial({
    color: 0x87ceeb,
    shininess: 30,
    flatShading: true
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  scene.add(mesh);

  let newCameraState = previousCameraState;

  // Adjust camera to fit the mesh only if no previous state exists
  if (!previousCameraState) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate camera distance based on object size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov;
    const cameraDistance = (maxDim * 1.5) / Math.tan((fov * Math.PI) / 360);
    
    // Position camera at an isometric view
    const cameraX = center.x + cameraDistance * Math.cos(Math.PI / 4);
    const cameraY = center.y + cameraDistance * Math.sin(Math.PI / 4);
    const cameraZ = center.z + cameraDistance;
    
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(center);
    controls.target.copy(center);

    newCameraState = {
      position: camera.position.clone(),
      target: controls.target.clone()
    };
  } else {
    // Restore previous camera and controls state
    camera.position.copy(previousCameraState.position);
    controls.target.copy(previousCameraState.target);
  }
  
  controls.update();

  return { mesh, cameraState: newCameraState };
} 