import * as THREE from "three";

import {
	PI, cos, sin, sqrt, randChoose, polToCar, degToRad,
	generateInvoluteCurve,
	rotateShape, reflectVec2Array
} from "./math.js";

const COLORS = [
	0x96a365,
	0x93a35a,
	0x9ae2f0,
	0xd861bb,
	0xa939a7,
	0xf6d1cb,
	0xe5d1d0,
	0x3881f0,
	0x064dbf,
	0xf6d061,
	0xf5d44f,
	0xc73a4a,
	0xdc4530
]

function generateGearSegment(pitchAngle, baseRadius, maxRadius, minRadius, alpha) {
	
	const involutePoints1 = generateInvoluteCurve(baseRadius, maxRadius);
	// const involutePoints2 = reflectVec2Array(involutePoints1, 1.045 * pitchAngle / 4);
	const involutePoints2 = reflectVec2Array(involutePoints1, pitchAngle / 4 + alpha);
	
	const involuteToothProfile = involutePoints1.concat(involutePoints2.reverse());

	const segmentShape = new THREE.Shape();
	segmentShape.moveTo(baseRadius, 0);
	segmentShape.setFromPoints(involuteToothProfile);
	// TODO: add circular cutout
	let pt = polToCar(minRadius, pitchAngle * 0.5 + 2 * alpha);
	segmentShape.lineTo(pt.x, pt.y);

	pt = polToCar(minRadius, pitchAngle)
	segmentShape.lineTo(pt.x, pt.y);
	segmentShape.lineTo(0,0);
	segmentShape.closePath()
	
	return rotateShape(segmentShape, -1 * alpha);
}

function generateGearShapeFromParams(params) {
	const segment = generateGearSegment(params.pitchAngle, params.baseCircleRadius, params.maxRadius, params.minRadius, params.alpha);
	const segments = [];
	for (var i = 0; i < params.teeth; i++) {
		segments.push(rotateShape(segment, i * params.pitchAngle))
	}
	return segments
}

function generateGearParams(teeth, mod, pressureAngleDeg) {
	const pressureAngle = degToRad(pressureAngleDeg);
	const pitchAngle = 2 * PI / teeth;
	const pitchCircleRadius = mod * teeth / 2;
	const baseCircleRadius = pitchCircleRadius * cos(pressureAngle);
	const addendum = mod;
	const dedendum = 1.2 * mod;
	const maxRadius = pitchCircleRadius + addendum;
	const minRadius = pitchCircleRadius - dedendum;
	const alpha = (sqrt(pitchCircleRadius**2 - baseCircleRadius**2) / baseCircleRadius) - pressureAngle;
	return {
		pressureAngle: pressureAngle,
		pressureAngleDeg: pressureAngleDeg,
		pitchAngle: pitchAngle,
		pitchCircleRadius: pitchCircleRadius,
		baseCircleRadius: baseCircleRadius,
		addendum: addendum,
		dedendum: dedendum,
		maxRadius: maxRadius,
		minRadius: minRadius,
		alpha: alpha,
		teeth: teeth,
		mod: mod
	}
}


export class Gear {

	constructor(teeth, mod = 3, pressureAngleDeg = 20, pinion) {
		
		this.teeth = teeth;
		this.mod = mod;
		// this.pressureAngle

		this.color = randChoose(COLORS);

		this.parameters = generateGearParams(teeth, mod, pressureAngleDeg);
		this.mesh = this.createGeometry(this.parameters);


		// defaults:
		this.angle = 0;
		this.x = 0;
		this.y = 0;

		this.childGears = new Set();

		if (pinion) {
			this.pinion = pinion;
		}

		this.calculateRatio()

	}

	reset() {
		this.parameters = generateGearParams(this.teeth, this.mod, this.parameters.pressureAngleDeg);
		this.geometry.dispose();
		this.material.dispose();
		// this.mesh.dispose();

		return this.createGeometry(this.parameters);
	}

	get rotation() {
		return this.mesh.rotation.z
	}

	set rotation(angle) {
		this.mesh.rotation.z = angle;
	}

	driveBy(angle) {
		// rotate this gear as if it was being driven
		// by the first gear in the drivetrain turning by an angle
		this.rotation += angle * this.rotationSpeed;
	}

	createGeometry(parameters) {
		const shape = generateGearShapeFromParams(parameters);
		const extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 1, steps: 1};
		this.geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);		
		this.geometry.computeVertexNormals();
		this.material = new THREE.MeshStandardMaterial({
			color: this.color,
			side: THREE.DoubleSide,  // This ensures both sides are visible
			// color: Math.random() * 0x0fffff,
			opacity: 1 });
		this.mesh = new THREE.Mesh( this.geometry, this.material );
		return this.mesh;
	}

	addToScene(scene) {
		scene.add(this.mesh);
		return this
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
		this.mesh.position.x = x;
		this.mesh.position.y = y;	
	}

	calculateRatio() {
		if (this.pinion) {
			this.ratio = this.pinion.teeth / this.teeth;
			this.rotationSpeed = -1 * this.pinion.rotationSpeed * this.ratio;
		} else {
			this.ratio = 1;
			this.rotationSpeed = 1;
		}
		return this
	}

	positionGear() {
		// position this gear relative to its pinion
		if (this.pinion) {
			// euclidean distance between centre of this gear and added gear:
			const centreDistance = (this.mod * this.teeth + this.mod * this.pinion.teeth) / 2;
			const offsetX = centreDistance * cos(this.angle);
			const offsetY = centreDistance * sin(this.angle);
			this.setPosition(
				this.pinion.x + offsetX,
				this.pinion.y + offsetY
				);
		}
		return this
	}

	rotateGear() {
		if (this.pinion) {
			// rotate this gear and pretend to rotate pinion so
			// their 'first teeth' touch and mesh together 
			// since pinion is really at a different position
			// we must use that position to drive this gear around
			// as if they were always meshed together 
			this.rotation += PI + this.angle;
			this.rotation += (this.angle - this.pinion.rotation) * this.ratio;
		}
		return this
	}

	addGear(teeth, angle) {
		const newGear = new this.constructor(
			teeth,
			this.mod,
			this.parameters.pressureAngleDeg,
			this // keep reference to this gear as pinion of new gear
		);

		this.childGears.add(newGear);

		newGear.angle = angle;
		newGear.positionGear();
		newGear.rotateGear();
				
		return newGear;
	}

	remove() {
		this.geometry.dispose();
		this.material.dispose();
		if (this.pinion) {
			const pinion = this.pinion;
			this.childGears.forEach( g => {
				g.pinion = pinion;
				pinion.childGears.add(g);
			});
		} 
	}
}

