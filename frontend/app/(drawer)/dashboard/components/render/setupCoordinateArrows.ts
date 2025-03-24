import * as THREE from 'three';

export function setupCoordinateArrows(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  // Create a group for the arrows
  const arrowGroup = new THREE.Group();
  
  // Create arrows for each axis - make them larger
  const arrowLength = 2;
  const headLength = 0.4;
  const headRadius = 0.2;

  // X axis - Red
  const xArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    arrowLength,
    0xff0000,
    headLength,
    headRadius
  );

  // Y axis - Green
  const yArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    arrowLength,
    0x00ff00,
    headLength,
    headRadius
  );

  // Z axis - Blue
  const zArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    arrowLength,
    0x0000ff,
    headLength,
    headRadius
  );

  // Add arrows to group
  arrowGroup.add(xArrow);
  arrowGroup.add(yArrow);
  arrowGroup.add(zArrow);

  // Add labels for each axis
  const createLabel = (text: string, position: THREE.Vector3, color: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = color;
    context.font = 'bold 96px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.5, 0.5);
    sprite.position.copy(position);
    return sprite;
  };

  arrowGroup.add(createLabel('X', new THREE.Vector3(arrowLength + 0.3, 0, 0), '#ff0000'));
  arrowGroup.add(createLabel('Y', new THREE.Vector3(0, arrowLength + 0.3, 0), '#00ff00'));
  arrowGroup.add(createLabel('Z', new THREE.Vector3(0, 0, arrowLength + 0.3), '#0000ff'));

  // Position at origin
  arrowGroup.position.set(0, 0, 0);

  // Add the group to the scene
  scene.add(arrowGroup);

  // Return an empty update function since we don't need to update position anymore
  return () => {};
} 