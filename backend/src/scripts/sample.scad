
// Example OpenSCAD code with various features
module roundedBox(size, radius) {
  x = size[0];
  y = size[1];
  z = size[2];
  
  translate([radius, radius, radius])
  minkowski() {
    cube([x-2*radius, y-2*radius, z-2*radius]);
    sphere(r=radius);
  }
}

// Variables and expressions
radius = 2;
width = 20;
height = 15;
depth = 10;

// Using the module
translate([0, 0, 0])
  roundedBox([width, height, depth], radius);

// If statement example
if (width > 15) {
  translate([width+10, 0, 0])
    cube([5, 5, 5]);
}

// For loop example  
for (i = [0:5:25]) {
  translate([i, height+10, 0])
    cylinder(h=5, r=2);
}
