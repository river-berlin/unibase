import { atom, useAtom } from 'jotai';

/**
 * Atom for storing the current OpenSCAD code
 */
export const openScadCodeAtom = atom<string>('');

/**
 * Hook to get and set OpenSCAD code
 */
export function useOpenScadCode() {
  const [openScadCode, setOpenScadCode] = useAtom(openScadCodeAtom);

  /**
   * Update OpenSCAD code
   * @param code - New OpenSCAD code
   */
  const setOpenScad = (code: string) => {
    setOpenScadCode(code);
  };

  return {
    openScadCode,
    setOpenScad
  };
} 