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
  plane.position.y = 0; // Ensure plane is at y=0
  plane.receiveShadow = true;
  scene.add(plane);
  return plane;
}

export function loadSTLObject(
  stlText: string | string[],
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: THREE.OrbitControls,
  previousMesh: THREE.Mesh | THREE.Group | null,
  previousCameraState: CameraState | null
): { mesh: THREE.Mesh | THREE.Group | null; cameraState: CameraState | null } {
  // Remove existing mesh or group
  if (previousMesh) {
    scene.remove(previousMesh);
  }

  // Convert single string to array for consistent processing
  const stlTextArray = Array.isArray(stlText) ? stlText : [stlText];
  
  // Check if all STL data is empty
  if (stlTextArray.every(text => !text || text.trim() === '')) {
    const emptyGeometry = new THREE.BufferGeometry();
    const emptyMesh = new THREE.Mesh(emptyGeometry, new THREE.MeshBasicMaterial());
    return { mesh: emptyMesh, cameraState: null };
  }

  const loader = new STLLoader();
  const group = new THREE.Group();
  let hasValidMeshes = false;
  
  // Process each STL string
  stlTextArray.forEach((text, index) => {
    if (!text || text.trim() === '') return;
    
    let geometry: THREE.BufferGeometry | null = null;
    try {
      geometry = loader.parse(text);
      geometry.center();
      
      // Calculate the bounding box to determine object height
      const boundingBox = new THREE.Box3().setFromBufferAttribute(
        geometry.getAttribute('position') as THREE.BufferAttribute
      );
      const objectHeight = boundingBox.max.y - boundingBox.min.y;
      
      // Use different colors for multiple objects
      const colors = [
        0x87ceeb, // light blue
        0x98fb98, // pale green
        0xffa07a, // light salmon
        0xdda0dd, // plum
        0xffe4b5  // moccasin
      ];
      
      const material = new THREE.MeshPhongMaterial({
        color: colors[index % colors.length],
        shininess: 30,
        flatShading: true
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Position the object on top of the plane
      // Set y position to half the object's height to place it on the plane
      mesh.position.y = objectHeight / 2;
      
      // Offset multiple objects so they don't overlap completely
      if (index > 0) {
        mesh.position.x += index * 0.5;
      }
      
      group.add(mesh);
      hasValidMeshes = true;
    } catch (error) {
      console.error(`Error loading STL at index ${index}:`, error);
    }
  });
  
  // If no valid meshes were created, return an empty mesh
  if (!hasValidMeshes) {
    const emptyGeometry = new THREE.BufferGeometry();
    const emptyMesh = new THREE.Mesh(emptyGeometry, new THREE.MeshBasicMaterial());
    return { mesh: emptyMesh, cameraState: null };
  }
  
  scene.add(group);
  
  let newCameraState = previousCameraState;

  // Adjust camera to fit the group only if no previous state exists
  if (!previousCameraState) {
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    // Ensure the camera target is at least slightly above the plane
    center.y = Math.max(center.y, 0.1);
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate camera distance based on object size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov;
    const cameraDistance = (maxDim * 2) / Math.tan((fov * Math.PI) / 360); // Increased multiplier to show all objects
    
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

  return { mesh: group, cameraState: newCameraState };
} 