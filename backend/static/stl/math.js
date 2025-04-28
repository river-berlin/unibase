import { Vector2, Shape } from "three";
const INVOLUTE_STEP = 0.05;
const ORIGIN_VEC2 = new Vector2(0, 0);

export const PI = Math.PI;
export const cos = Math.cos;
export const sin = Math.sin;
export const sqrt = Math.sqrt;
export const atan2 = Math.atan2;


export function randChoose(array) {
	const index = Math.floor(Math.random() * array.length);
	return array[index];
}

export function randInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min)
}

export function randFloat(min, max) {
	return Math.random() * (max - min) + min
}

// math conversion utils
export function carToPol(x, y) {
	// returns r / 'radius' (distance to origin)
	// and w (angle from x axis - in RADIANS!!)
	return {
		r: sqrt(x*x + y*y),
		w: atan2(y,x)
	}
}

export function polToCar(r, w) {
	return {
		x: r * cos(w),
		y: r * sin(w)
	}
}

export function degToRad(angle) {
	return angle * PI / 180;
}

export function radToDeg(angle) {
	return 180 * angle / PI;
}

export function involutePoint(t, baseRadius) {
	return new Vector2(
		baseRadius * (cos(t) + t * sin(t)),
		baseRadius * (sin(t) - t * cos(t))
	)	
}

export function generateInvoluteCurve(baseRadius, maxRadius, step = INVOLUTE_STEP) {
	const endPointParam = sqrt((maxRadius ** 2 / baseRadius ** 2) - 1 );
	const pointsArray = [];
	let t = 0;
	let point = involutePoint(t, baseRadius);
	while ( point.length() < maxRadius) {
		point = involutePoint(t, baseRadius);
		pointsArray.push(point);
		t += step;
	};

	point = involutePoint(endPointParam, baseRadius);
	pointsArray.push(point);
	return pointsArray;
}

export function rotateVec2Array(array, angle, origin = ORIGIN_VEC2) {
	return array.map(vec => vec.rotateAround(origin, angle)) 
}

export function rotateShape(shape, rotationAngle) {
	if (rotationAngle % (2 * PI) == 0) {
		return shape
	} else {
		return new Shape(rotateVec2Array(shape.getPoints(), rotationAngle));
	}
}

export function reflectVec2Array(array, angle) {
	// reflect array of vec2 in ray which makes angle with x-axis
	return array.map(vec => new Vector2(
			cos(2 * angle) * vec.x + sin(2 * angle) * vec.y,
			sin(2 * angle) * vec.x - cos(2 * angle) * vec.y	
		)
	)
}