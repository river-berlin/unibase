import { atom, useAtom } from 'jotai';
import { GetProjectCodeResponses } from '~/client';

// Define a non-nullable version of the objects type
type CodeObject = NonNullable<GetProjectCodeResponses['200']['objects']>[number];
export type NonNullableCodeObjects = CodeObject[];

/**
 * Atom for storing the current javascript code
 */
export const codeAtom = atom<NonNullableCodeObjects>([]);

/**
 * Hook to get and set OpenSCAD code
 */
export function useCode() {
  const [code, setAtom] = useAtom(codeAtom);

  /**
   * Update javascript code
   * @param code - New javascript code
   */
  const setCode = (code: GetProjectCodeResponses['200']['objects']) => {
    // Handle undefined by setting to empty array
    setAtom(code || []);
  };

  return {
    code,
    setCode
  };
} 