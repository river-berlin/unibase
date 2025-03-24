import { scadToStl } from '../../../craftstool/openscad';
import Anthropic from '@anthropic-ai/sdk';
import { runCompletionAndUpdateDatabase } from './helpers/completions';
import { DB } from '../../../database/db';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages';

export interface GenerateResult {
  messages: MessageParam[];
  stl: string;
  scad: string;
}


export async function generateObjects(
  instructions: string,
  existingScad: string | undefined,
  projectId: string,
  userId: string,
  db: DB,
  anthropic: Anthropic,
  sceneImageBase64: string
): Promise<GenerateResult> {
  // Run completion and update database
  const { messages, scad } = await runCompletionAndUpdateDatabase(
    instructions,
    existingScad,
    projectId,
    userId,
    db,
    anthropic,
    sceneImageBase64
  );

  const start = Date.now();
  let stl = await scadToStl(scad);
  const end = Date.now();
  console.log(`STL generation completed in ${end - start}ms`);

  return {
    messages,
    stl,
    scad
  };
} 