import * as THREE from 'three';

export function setupLighting(scene: THREE.Scene) {
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Add directional light from the front-left
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  

  // Add a light from the top
  const topLight = new THREE.DirectionalLight(0xffffff, 0.7);
  topLight.position.set(5, 10, 0);
  topLight.castShadow = true;
  scene.add(topLight);

  // Add a light from the bottom
  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.7);
  bottomLight.position.set(0, -10, 0);
  bottomLight.castShadow = true;
  scene.add(bottomLight);

  // Add a light from the right side
  const rightLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rightLight.position.set(10, 0, 0);
  rightLight.castShadow = true;
  scene.add(rightLight);

  // Add a light from the right side
  const leftLight = new THREE.DirectionalLight(0xffffff, 0.5);
  leftLight.position.set(-10, 0, 0);
  leftLight.castShadow = true;
  scene.add(leftLight);

  return { ambientLight, directionalLight, topLight, rightLight };
}
