import { atom, useAtom } from 'jotai';

/**
 * Atom for storing the current STL data
 */
export const stlDataAtom = atom<string | null | Array<string>>(null);
export const isGeneratingStlAtom = atom<boolean>(false);

/**
 * Hook to get and set STL data
 */
export function useStlData() {
  const [stlData, setStlData] = useAtom(stlDataAtom);
  const [isGeneratingStl, setIsGeneratingStl] = useAtom(isGeneratingStlAtom);

  /**
   * Update STL data
   * @param stl - New STL data
   */
  const setStl = (stl: string | null | Array<string>) => {
    setStlData(stl);
  };

  return {
    stlData,
    setStl,
    isGeneratingStl,
    setIsGeneratingStl
  };
} 