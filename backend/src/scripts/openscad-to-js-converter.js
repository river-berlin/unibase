const { parseFile, parseString } = require('openscad-parser');
const fs = require('fs');
const path = require('path');

// Simple OpenSCAD to JavaScript converter
class OpenSCADConverter {
  constructor() {
    this.indentLevel = 0;
    this.indent = '  '; // Two spaces for indentation
  }

  /**
   * Convert an OpenSCAD file to JavaScript
   * @param {string} filePath - Path to the OpenSCAD file
   * @returns {string} - JavaScript code
   */
  convertFile(filePath) {
    console.log(`Converting file: ${filePath}`);
    const ast = parseFile(filePath);
    return this.convertASTToJS(ast);
  }

  /**
   * Convert OpenSCAD code string to JavaScript
   * @param {string} scadCode - OpenSCAD code
   * @returns {string} - JavaScript code
   */
  convertString(scadCode) {
    console.log('Converting OpenSCAD string to JavaScript');
    const ast = parseString(scadCode);
    return this.convertASTToJS(ast);
  }

  /**
   * Convert AST to JavaScript code
   * @param {Object} ast - OpenSCAD AST
   * @returns {string} - JavaScript code
   */
  convertASTToJS(ast) {
    // Start with imports and preamble
    let jsCode = this.generatePreamble();
    
    // Process each top-level node
    if (ast.children && ast.children.length > 0) {
      for (const node of ast.children) {
        const nodeCode = this.processNode(node);
        if (nodeCode) {
          jsCode += nodeCode + '\n\n';
        }
      }
    }
    
    // Add exports
    jsCode += this.generateExports();
    
    return jsCode;
  }

  /**
   * Generate JS code for a specific AST node
   * @param {Object} node - AST node
   * @returns {string} - JavaScript code for the node
   */
  processNode(node) {
    if (!node || !node.type) return '';

    switch(node.type) {
      case 'ModuleDeclaration':
        return this.processModule(node);
      case 'FunctionDeclaration':
        return this.processFunction(node);
      case 'Assignment':
        return this.processAssignment(node);
      case 'Expression':
        return this.processExpression(node);
      case 'ModuleInstantiation':
        return this.processModuleInstantiation(node);
      case 'BlockStatement':
        return this.processBlockStatement(node);
      case 'IfStatement':
        return this.processIfStatement(node);
      case 'ForLoop':
        return this.processForLoop(node);
      default:
        return `// Unhandled node type: ${node.type}`;
    }
  }

  /**
   * Process module declaration
   * @param {Object} node - Module declaration node
   * @returns {string} - JavaScript function
   */
  processModule(node) {
    const moduleName = node.id?.value || 'unknownModule';
    let parameters = [];
    
    if (node.parameters && node.parameters.length > 0) {
      parameters = node.parameters.map(param => {
        const name = param.name?.value || 'param';
        let defaultValue = '';
        
        if (param.value) {
          defaultValue = ` = ${this.processExpression(param.value)}`;
        }
        
        return name + defaultValue;
      });
    }
    
    // Always include children parameter for OpenSCAD modules
    parameters.push('children = []');
    
    let code = `// Converted from OpenSCAD module\nfunction module_${moduleName}(${parameters.join(', ')}) {\n`;
    
    this.indentLevel++;
    
    if (node.body) {
      const bodyCode = this.processNode(node.body);
      code += this.getIndent() + bodyCode.replace(/\n/g, '\n' + this.getIndent());
    } else {
      code += this.getIndent() + '// Empty module body\n';
      code += this.getIndent() + 'return null;';
    }
    
    this.indentLevel--;
    code += '\n}';
    
    return code;
  }

  /**
   * Process function declaration
   * @param {Object} node - Function declaration node
   * @returns {string} - JavaScript function
   */
  processFunction(node) {
    const funcName = node.id?.value || 'unknownFunction';
    let parameters = [];
    
    if (node.parameters && node.parameters.length > 0) {
      parameters = node.parameters.map(param => {
        return param.name?.value || 'param';
      });
    }
    
    let code = `// Converted from OpenSCAD function\nfunction fn_${funcName}(${parameters.join(', ')}) {\n`;
    
    this.indentLevel++;
    
    if (node.expression) {
      const exprCode = this.processExpression(node.expression);
      code += this.getIndent() + `return ${exprCode};`;
    } else {
      code += this.getIndent() + '// Empty function body\n';
      code += this.getIndent() + 'return null;';
    }
    
    this.indentLevel--;
    code += '\n}';
    
    return code;
  }

  /**
   * Process assignment
   * @param {Object} node - Assignment node
   * @returns {string} - JavaScript assignment
   */
  processAssignment(node) {
    if (!node.left || !node.right) return '// Invalid assignment';
    
    const varName = node.left.value || 'unknownVar';
    const rightSide = this.processExpression(node.right);
    
    return `const ${varName} = ${rightSide};`;
  }

  /**
   * Process expression
   * @param {Object} node - Expression node
   * @returns {string} - JavaScript expression
   */
  processExpression(node) {
    if (!node) return 'null';
    
    if (node.type === 'Expression' && node.expression) {
      return this.processExpression(node.expression);
    }
    
    if (node.type === 'Literal') {
      return node.value.toString();
    }
    
    if (node.type === 'Identifier') {
      return node.value || 'undefined';
    }
    
    if (node.type === 'BinaryExpression') {
      const left = this.processExpression(node.left);
      const right = this.processExpression(node.right);
      const operator = node.operator;
      
      return `(${left} ${operator} ${right})`;
    }
    
    if (node.type === 'ArrayExpression') {
      if (!node.elements) return '[]';
      
      const elements = node.elements.map(elem => this.processExpression(elem));
      return `[${elements.join(', ')}]`;
    }
    
    if (node.type === 'FunctionCall') {
      const name = node.id?.value || 'unknownFunction';
      const args = node.arguments?.map(arg => this.processExpression(arg)) || [];
      
      return `fn_${name}(${args.join(', ')})`;
    }
    
    return '/* Unprocessed expression */';
  }

  /**
   * Process module instantiation (e.g., cube(), sphere(), etc.)
   * @param {Object} node - Module instantiation node
   * @returns {string} - JavaScript equivalent
   */
  processModuleInstantiation(node) {
    if (!node.name || !node.name.value) return '// Invalid module call';
    
    const moduleName = node.name.value;
    let args = [];
    
    // Process arguments (can be positional or named)
    if (node.arguments && node.arguments.length > 0) {
      args = node.arguments.map(arg => {
        if (arg.type === 'KeyValuePair') {
          const key = arg.key?.value || 'unknown';
          const value = this.processExpression(arg.value);
          return `${key}: ${value}`;
        } else {
          return this.processExpression(arg);
        }
      });
    }
    
    // Handle different module types
    let jsCall = '';
    
    // Process child modules if they exist
    let childrenCode = '';
    if (node.children && node.children.length > 0) {
      const childItems = node.children.map(child => this.processNode(child)).filter(Boolean);
      if (childItems.length > 0) {
        childrenCode = `[${childItems.join(', ')}]`;
      }
    }
    
    // Common 3D primitives
    const threeDObjects = ['cube', 'sphere', 'cylinder', 'polyhedron'];
    const transforms = ['translate', 'rotate', 'scale', 'mirror', 'multmatrix', 'color'];
    const booleans = ['union', 'difference', 'intersection'];
    
    if (threeDObjects.includes(moduleName)) {
      // Handle 3D primitives
      jsCall = `${moduleName}({${args.join(', ')}})`;
    } else if (transforms.includes(moduleName)) {
      // Handle transformations
      const transformArgs = args.length > 0 ? `{${args.join(', ')}}` : '{}';
      const children = childrenCode || '[]';
      jsCall = `${moduleName}(${transformArgs}, ${children})`;
    } else if (booleans.includes(moduleName)) {
      // Handle boolean operations
      jsCall = `${moduleName}(${childrenCode || '[]'})`;
    } else {
      // Handle custom modules
      jsCall = `module_${moduleName}(${args.join(', ')}${args.length > 0 ? ', ' : ''}${childrenCode || '[]'})`;
    }
    
    return jsCall;
  }

  /**
   * Process block statement (a group of statements)
   * @param {Object} node - Block statement node
   * @returns {string} - JavaScript code
   */
  processBlockStatement(node) {
    if (!node.children || node.children.length === 0) {
      return '// Empty block';
    }
    
    return node.children
      .map(child => this.processNode(child))
      .filter(Boolean)
      .join(';\n' + this.getIndent());
  }

  /**
   * Process if statement
   * @param {Object} node - If statement node
   * @returns {string} - JavaScript if statement
   */
  processIfStatement(node) {
    if (!node.condition) return '// Invalid if statement';
    
    const condition = this.processExpression(node.condition);
    let code = `if (${condition}) {\n`;
    
    this.indentLevel++;
    
    if (node.trueExpression) {
      const trueCode = this.processNode(node.trueExpression);
      code += this.getIndent() + trueCode;
    }
    
    this.indentLevel--;
    code += '\n' + this.getIndent() + '}';
    
    if (node.falseExpression) {
      code += ' else {\n';
      
      this.indentLevel++;
      
      const falseCode = this.processNode(node.falseExpression);
      code += this.getIndent() + falseCode;
      
      this.indentLevel--;
      code += '\n' + this.getIndent() + '}';
    }
    
    return code;
  }

  /**
   * Process for loop
   * @param {Object} node - For loop node
   * @returns {string} - JavaScript for loop
   */
  processForLoop(node) {
    if (!node.variable || !node.range) return '// Invalid for loop';
    
    const variable = node.variable.value || 'i';
    const range = this.processExpression(node.range);
    
    // OpenSCAD ranges can be complex, this is simplified
    let code = `for (let ${variable} of ${range}) {\n`;
    
    this.indentLevel++;
    
    if (node.body) {
      const bodyCode = this.processNode(node.body);
      code += this.getIndent() + bodyCode;
    }
    
    this.indentLevel--;
    code += '\n' + this.getIndent() + '}';
    
    return code;
  }

  /**
   * Generate the preamble with imports and setup
   * @returns {string} - JavaScript preamble
   */
  generatePreamble() {
    return `// Generated from OpenSCAD code
import { cube, sphere, cylinder } from 'basics';
import { union, difference, intersection } from 'basics';
import { translate, rotate, scale } from 'basics';

// Main model variables
let obj; // The main output object

`;
  }

  /**
   * Generate exports at the end of the file
   * @returns {string} - JavaScript exports
   */
  generateExports() {
    return `// Export the final object
export { obj };
`;
  }

  /**
   * Get current indentation
   * @returns {string} - Indentation string
   */
  getIndent() {
    return this.indent.repeat(this.indentLevel);
  }
}

// Sample OpenSCAD code
const sampleCode = `
// Simple OpenSCAD example
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

// Parameters
radius = 2;
width = 20;
height = 15;
depth = 10;

// Create main object
difference() {
  roundedBox([width, height, depth], radius);
  
  // Hollow out the inside
  translate([2, 2, 2])
    scale([0.8, 0.8, 1])
      roundedBox([width-4, height-4, depth], radius/2);
}

// Add some cylinders on top
for (i = [0:5:20]) {
  translate([i, i, depth])
    cylinder(h=5, r=1.5);
}
`;

// Save sample to file
const sampleFilePath = path.join(__dirname, 'sample.scad');
fs.writeFileSync(sampleFilePath, sampleCode);
console.log(`Created sample OpenSCAD file at: ${sampleFilePath}`);

// Run the converter
const converter = new OpenSCADConverter();
const javascriptCode = converter.convertString(sampleCode);

// Save the converted JS code
const jsOutputPath = path.join(__dirname, 'converted.js');
fs.writeFileSync(jsOutputPath, javascriptCode);
console.log(`Converted JavaScript saved to: ${jsOutputPath}`);

// Print the converted code
console.log('\nConverted JavaScript:');
console.log(javascriptCode);

console.log('\nTest completed! The converter is basic but demonstrates the conversion process.');
console.log('You can enhance it to handle more OpenSCAD features and improve the output quality.');
