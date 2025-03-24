import { atom, useAtom } from 'jotai';

/**
 * Atom for storing the current STL data
 */
export const stlDataAtom = atom<string | null>(null);

/**
 * Hook to get and set STL data
 */
export function useStlData() {
  const [stlData, setStlData] = useAtom(stlDataAtom);

  /**
   * Update STL data
   * @param stl - New STL data
   */
  const setStl = (stl: string | null) => {
    setStlData(stl);
  };

  return {
    stlData,
    setStl
  };
} 