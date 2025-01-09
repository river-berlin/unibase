/**
 * @param {string} fullText
 */
export const extractJsonPrompt = (fullText) => `Extract only the JSON portion from this response, ensuring it matches this exact schema:

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