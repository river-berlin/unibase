import { atom, useAtom } from 'jotai';

/**
 * Atom for storing the current scene image as a base64 string
 */
export const sceneImageAtom = atom<string>('');

/**
 * Hook to get and set scene image
 */
export function useSceneImage() {
  const [sceneImage, setSceneImage] = useAtom(sceneImageAtom);

  /**
   * Update scene image
   * @param image - New scene image as base64 string
   */
  const setImage = (image: string) => {
    setSceneImage(image);
  };

  return {
    sceneImage,
    setImage
  };
} 