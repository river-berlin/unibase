import { Tool } from '@anthropic-ai/sdk/resources/messages/messages';
import { z, ZodType } from 'zod';

/**
 * Base type for tool function implementation
 * Tool functions now return a string directly instead of an object
 */
export type ToolFunction<T = any> = (params: T) => Promise<string>;

/**
 * Base interface for Anthropic tool declaration
 */
export interface ToolDeclaration extends Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Base interface for Zod tool declaration
 */
export interface ZodToolDeclaration<T extends ZodType = ZodType> {
  name: string;
  description: string;
  schema: T;
}

/**
 * Base interface for tool details that combines all components
 */
export interface ToolDetails<T = any, S extends ZodType = ZodType> {
  declaration: ToolDeclaration;
  zodDeclaration: ZodToolDeclaration<S>;
  function: ToolFunction<T>;
  name?: string; // Optional name that can be derived from declarations
}
