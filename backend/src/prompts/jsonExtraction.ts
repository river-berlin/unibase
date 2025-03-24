interface ModuleParams {
  size?: number[];
  r?: number;
  h?: number;
  center?: boolean;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Module {
  module: string;
  params: ModuleParams;
  position: Position;
  rotation: Position;
}

interface Scene {
  rotation: Position;
}

interface ExtractedJson {
  modules: Module[];
  scene: Scene;
}

/**
 * Generates a prompt to extract JSON data from text that matches a specific schema
 * @param {string} fullText - The text to extract JSON from
 * @returns {string} The prompt for extracting JSON
 */
export const extractJsonPrompt = (fullText: string): string => `Extract only the JSON portion from this response, ensuring it matches this exact schema:

{
  "type": "object",
  "properties": {
    "scene": {
      "type": "object",
      "properties": {
        "rotation": {
          "type": "object",
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" },
            "z": { "type": "number" }
          },
          "required": ["x", "y", "z"]
        }
      }
    },
    "modules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "module": {
            "type": "string",
            "description": "Name of the OpenSCAD module"
          },
          "params": {
            "type": "object",
            "description": "Module parameters (excluding $fn)",
            "properties": {
              "size": {
                "type": "array",
                "items": { "type": "number" },
                "description": "Size for cube [x,y,z]"
              },
              "r": {
                "type": "number",
                "description": "Radius for sphere or cylinder"
              },
              "h": {
                "type": "number",
                "description": "Height for cylinder"
              },
              "center": {
                "type": "boolean",
                "description": "Center the primitive"
              }
            }
          },
          "position": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" },
              "z": { "type": "number" }
            },
            "required": ["x", "y", "z"]
          },
          "rotation": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" },
              "z": { "type": "number" }
            },
            "required": ["x", "y", "z"]
          }
        },
        "required": ["module", "params", "position", "rotation"]
      }
    }
  },
  "required": ["modules", "scene"]
}

From this text:

${fullText}

Return only the JSON object with the "modules" array and "scene" object that matches this schema exactly.`; 