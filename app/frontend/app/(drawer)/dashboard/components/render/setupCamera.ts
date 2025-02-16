import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export function setupCamera(
  width: number,
  height: number,
  renderer: THREE.WebGLRenderer
) {
  const camera = new THREE.PerspectiveCamera(
    30,
    width / height,
    0.1,
    10000
  );
  camera.position.set(50, 50, 50);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  return { camera, controls };
}

export function updateCameraAspect(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number
) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

export function getRenderImage(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): string {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
} 