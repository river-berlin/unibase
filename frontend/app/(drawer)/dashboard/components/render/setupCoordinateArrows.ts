import * as THREE from 'three';

export function setupCoordinateArrows(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
  // Create a separate scene for the fixed coordinate arrows with transparent background
  const uiScene = new THREE.Scene();
  uiScene.background = null; // Transparent background
  
  // Create a group for the arrows
  const arrowGroup = new THREE.Group();
  
  // Line length for the axes
  const lineLength = 0.6;
  
  // Create a helper function to create a line
  const createAxisLine = (direction: THREE.Vector3, color: number) => {
    // Create line geometry with two points
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(direction.clone().multiplyScalar(lineLength));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
  };
  
  // X axis - Red
  const xLine = createAxisLine(new THREE.Vector3(1, 0, 0), 0xff0000);
  
  // Y axis - Green
  const yLine = createAxisLine(new THREE.Vector3(0, 1, 0), 0x00ff00);
  
  // Z axis - Blue
  const zLine = createAxisLine(new THREE.Vector3(0, 0, 1), 0x0000ff);

  // Add lines to group
  arrowGroup.add(xLine);
  arrowGroup.add(yLine);
  arrowGroup.add(zLine);

  // Add labels for each axis
  const createLabel = (text: string, position: THREE.Vector3, color: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 64; // Smaller canvas
    canvas.height = 64;

    context.fillStyle = color;
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.3, 0.3, 0.3);
    sprite.position.copy(position);
    return sprite;
  };

  arrowGroup.add(createLabel('X', new THREE.Vector3(lineLength + 0.2, 0, 0), '#ff0000'));
  arrowGroup.add(createLabel('Y', new THREE.Vector3(0, lineLength + 0.2, 0), '#00ff00'));
  arrowGroup.add(createLabel('Z', new THREE.Vector3(0, 0, lineLength + 0.2), '#0000ff'));

  // Position the arrows slightly back from the camera
  arrowGroup.position.set(0, 0, -5);
  
  // Add the group to our UI scene
  uiScene.add(arrowGroup);

  // Create an orthographic camera for UI rendering
  const uiCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  uiCamera.position.set(0, 0, 0);
  
  // Update function that gets called in the animation loop
  return () => {
    // Sync the arrow group's rotation with the main camera
    // This ensures arrows maintain correct orientation as the main scene rotates
    arrowGroup.quaternion.copy(camera.quaternion);
    
    // Save current renderer state
    const currentViewport = renderer.getViewport(new THREE.Vector4());
    const currentScissor = renderer.getScissor(new THREE.Vector4());
    const currentScissorTest = renderer.getScissorTest();
    
    // Get the current canvas size
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    
    // Define the size and position of our corner display
    const cornerSize = Math.min(width, height) / 5; // 20% of the smallest dimension
    renderer.setViewport(0, 0, cornerSize, cornerSize);
    renderer.setScissor(0, 0, cornerSize, cornerSize);
    renderer.setScissorTest(true);
    
    // Save renderer's current clear settings
    const autoClear = renderer.autoClear;
    const autoClearColor = renderer.autoClearColor;
    const autoClearDepth = renderer.autoClearDepth;
    const autoClearStencil = renderer.autoClearStencil;
    
    // Configure for our overlay
    renderer.autoClear = false;
    renderer.autoClearColor = false; // Don't clear color
    renderer.autoClearDepth = true;  // Only clear depth
    renderer.autoClearStencil = false;
    
    // Render the UI scene with our arrows
    renderer.render(uiScene, uiCamera);
    
    // Restore previous renderer state
    renderer.setViewport(currentViewport);
    renderer.setScissor(currentScissor);
    renderer.setScissorTest(currentScissorTest);
    
    // Restore renderer's clear settings
    renderer.autoClear = autoClear;
    renderer.autoClearColor = autoClearColor;
    renderer.autoClearDepth = autoClearDepth;
    renderer.autoClearStencil = autoClearStencil;
  };
} 