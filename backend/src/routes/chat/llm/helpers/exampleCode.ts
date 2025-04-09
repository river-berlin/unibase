export const JSExampleCode = `

Example 1: Creating glasses
\`\`\`javascript
import * as THREE from "three";
import { cuboid, cylinder, subtract, toStl } from "basics";

// Create a pair of glasses
function createGlasses() {
  // Create a scene
  const scene = new THREE.Scene();
  
  // Material for the frames
  const frameMaterial = new THREE.MeshPhongMaterial({
    color: 0x3a3a3a,
    shininess: 100,
    specular: 0x111111
  });
  
  // Material for the lenses
  const lensMaterial = new THREE.MeshPhongMaterial({
    color: 0x8888ff,
    transparent: true,
    opacity: 0.4,
    shininess: 100
  });
  
  // Dimensions
  const rimRadius = 0.5;
  const rimThickness = 0.08;
  const lensRadius = rimRadius - rimThickness;
  
  // Left rim
  const leftRim = new THREE.Mesh(
    new THREE.TorusGeometry(rimRadius, rimThickness, 16, 32),
    frameMaterial
  );
  leftRim.position.set(-0.7, 0, 0);
  scene.add(leftRim);
  
  // Right rim
  const rightRim = new THREE.Mesh(
    new THREE.TorusGeometry(rimRadius, rimThickness, 16, 32),
    frameMaterial
  );
  rightRim.position.set(0.7, 0, 0);
  scene.add(rightRim);
  
  // Bridge (connecting the rims)
  const bridge = new THREE.Mesh(
    new THREE.CylinderGeometry(rimThickness/2, rimThickness/2, 0.4, 8),
    frameMaterial
  );
  bridge.rotation.z = Math.PI / 2;
  scene.add(bridge);
  
  // Left lens
  const leftLens = new THREE.Mesh(
    new THREE.CylinderGeometry(lensRadius, lensRadius, 0.05, 32),
    lensMaterial
  );
  leftLens.position.set(-0.7, 0, 0);
  leftLens.rotation.x = Math.PI / 2;
  scene.add(leftLens);
  
  // Right lens
  const rightLens = new THREE.Mesh(
    new THREE.CylinderGeometry(lensRadius, lensRadius, 0.05, 32),
    lensMaterial
  );
  rightLens.position.set(0.7, 0, 0);
  rightLens.rotation.x = Math.PI / 2;
  scene.add(rightLens);
  
  return scene;
}

// Create and return the glasses
const scene = createGlasses();

// Export scene to STL
export function generateStls() {
  return [toStl(scene)];
}
\`\`\`

Example 2: Creating a snowman
\`\`\`javascript
import * as THREE from "three";
import { sphere, cylinder, cone, toStl } from "basics";

// Create a snowman
function createSnowman() {
  // Create a scene
  const scene = new THREE.Scene();
  
  // Snow material (white and slightly shiny)
  const snowMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 30
  });
  
  // Coal material for eyes and buttons
  const coalMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 10
  });
  
  // Carrot material for nose
  const carrotMaterial = new THREE.MeshPhongMaterial({
    color: 0xff7800,
    shininess: 30
  });
  
  // Bottom sphere (largest)
  const bottomSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 32, 32),
    snowMaterial
  );
  bottomSphere.position.y = -0.75;
  scene.add(bottomSphere);
  
  // Middle sphere
  const middleSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    snowMaterial
  );
  middleSphere.position.y = 0.3;
  scene.add(middleSphere);
  
  // Head sphere (smallest)
  const headSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 32),
    snowMaterial
  );
  headSphere.position.y = 1.0;
  scene.add(headSphere);
  
  // Left eye
  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    coalMaterial
  );
  leftEye.position.set(-0.1, 1.05, 0.3);
  scene.add(leftEye);
  
  // Right eye
  const rightEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    coalMaterial
  );
  rightEye.position.set(0.1, 1.05, 0.3);
  scene.add(rightEye);
  
  // Carrot nose
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.3, 16),
    carrotMaterial
  );
  nose.position.set(0, 0.95, 0.35);
  nose.rotation.x = Math.PI / 2;
  scene.add(nose);
  
  // Buttons
  for (let i = 0; i < 3; i++) {
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      coalMaterial
    );
    button.position.set(0, 0.3 - i * 0.2, 0.5);
    scene.add(button);
  }
  
  return scene;
}

// Create and return the snowman
const scene = createSnowman();

// Export scene to STL
export function generateStls() {
  return [toStl(scene)];
}
\`\`\`

Example 3: Creating a simple table
\`\`\`javascript
import * as THREE from "three";
import { cuboid, toStl } from "basics";

// Create a simple table
function createTable() {
  // Create a scene
  const scene = new THREE.Scene();
  
  // Wood material for the table
  const woodMaterial = new THREE.MeshPhongMaterial({
    color: 0x8B4513,
    shininess: 30
  });
  
  // Table top
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.1, 1),
    woodMaterial
  );
  tableTop.position.y = 0.75;
  scene.add(tableTop);
  
  // Table legs
  const legGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
  
  // Front left leg
  const frontLeftLeg = new THREE.Mesh(legGeometry, woodMaterial);
  frontLeftLeg.position.set(-0.9, 0, 0.4);
  scene.add(frontLeftLeg);
  
  // Front right leg
  const frontRightLeg = new THREE.Mesh(legGeometry, woodMaterial);
  frontRightLeg.position.set(0.9, 0, 0.4);
  scene.add(frontRightLeg);
  
  // Back left leg
  const backLeftLeg = new THREE.Mesh(legGeometry, woodMaterial);
  backLeftLeg.position.set(-0.9, 0, -0.4);
  scene.add(backLeftLeg);
  
  // Back right leg
  const backRightLeg = new THREE.Mesh(legGeometry, woodMaterial);
  backRightLeg.position.set(0.9, 0, -0.4);
  scene.add(backRightLeg);
  
  return scene;
}

// Create and return the table
const scene = createTable();

// Export scene to STL
export function generateStls() {
  return [toStl(scene)];
}
\`\`\`
`;