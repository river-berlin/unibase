export const JSExampleCode = `

Example 1: Creating a hexagon table
\`\`\`javascript
import { polygon, cylinder, union } from "basics";

const tableTop = polygon({
  radius: 1.5,
  sides: 6,
  height: 0.1,
  position: {x: 0, y: 0.75, z: 0}
});

const createLeg = (angle) => {
  const distance = 1.2;
  const x = distance * Math.cos(angle);
  const z = distance * Math.sin(angle);
  
  return cylinder({
    radius: 0.1,
    height: 1.5,
    position: {x, y: 0, z}
  });
};

let legs = createLeg(0);
for (let i = 1; i < 6; i++) {
  const angle = (i * Math.PI * 2) / 6;
  const leg = createLeg(angle);
  legs = union(legs, leg);
}

const table = union(tableTop, legs);

export const object = table;
\`\`\`

Example 2: Creating glasses
\`\`\`javascript
import { cylinder, union } from "basics";

const rimRadius = 0.5;
const rimThickness = 0.08;

const leftRim = {
  geometry: new TorusGeometry(rimRadius, rimThickness, 16, 32),
  position: {x: -0.7, y: 0, z: 0}
};

const rightRim = {
  geometry: new TorusGeometry(rimRadius, rimThickness, 16, 32),
  position: {x: 0.7, y: 0, z: 0}
};

const bridge = cylinder({
  radius: rimThickness/2,
  height: 0.4,
  position: {x: 0, y: 0, z: 0},
  rotation: {x: 0, y: 0, z: Math.PI / 2}
});

const leftPart = union(leftRim, bridge);
const glasses = union(leftPart, rightRim);

export const object = glasses;
\`\`\`

Example 2: Creating a snowman
\`\`\`javascript
import { sphere, cone, union } from "basics";

const bottomSphere = sphere({
  radius: 0.75,
  position: {x: 0, y: -0.75, z: 0}
});

const middleSphere = sphere({
  radius: 0.5,
  position: {x: 0, y: 0.3, z: 0}
});

const headSphere = sphere({
  radius: 0.35,
  position: {x: 0, y: 1.0, z: 0}
});

const nose = cone({
  radius: 0.08,
  height: 0.3,
  position: {x: 0, y: 0.95, z: 0.35},
  rotation: {x: Math.PI / 2, y: 0, z: 0}
});

const leftEye = sphere({
  radius: 0.05,
  position: {x: -0.1, y: 1.05, z: 0.3}
});

const rightEye = sphere({
  radius: 0.05,
  position: {x: 0.1, y: 1.05, z: 0.3}
});

const bodyBase = union(bottomSphere, middleSphere);
const bodyWithHead = union(bodyBase, headSphere);
const bodyWithFace = union(bodyWithHead, nose);
const faceWithLeftEye = union(bodyWithFace, leftEye);
const snowman = union(faceWithLeftEye, rightEye);

export const object = snowman;
\`\`\`

Example 3: Creating a simple table
\`\`\`javascript
import { cuboid, union } from "basics";

const tableTop = cuboid({
  width: 2,
  height: 0.1,
  depth: 1,
  position: {x: 0, y: 0.75, z: 0}
});

const frontLeftLeg = cuboid({
  width: 0.1,
  height: 1.5,
  depth: 0.1,
  position: {x: -0.9, y: 0, z: 0.4}
});

const frontRightLeg = cuboid({
  width: 0.1,
  height: 1.5,
  depth: 0.1,
  position: {x: 0.9, y: 0, z: 0.4}
});

const backLeftLeg = cuboid({
  width: 0.1,
  height: 1.5,
  depth: 0.1,
  position: {x: -0.9, y: 0, z: -0.4}
});

const backRightLeg = cuboid({
  width: 0.1,
  height: 1.5,
  depth: 0.1,
  position: {x: 0.9, y: 0, z: -0.4}
});

const frontLegs = union(frontLeftLeg, frontRightLeg);
const backLegs = union(backLeftLeg, backRightLeg);
const allLegs = union(frontLegs, backLegs);
const table = union(tableTop, allLegs);

export const object = table;
\`\`\`
`;