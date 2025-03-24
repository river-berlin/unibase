// Export all atoms and hooks
export { openScadCodeAtom, useOpenScadCode } from './openScadCode';
export { stlDataAtom, useStlData } from './stlData';
export { chatMessagesAtom, useChatMessages, type Message } from './chatMessages';
export { projectAtom, useProject, type Project } from './project';
export { sceneImageAtom, useSceneImage } from './sceneImage';
export { codeAtom, useCode } from './code';

// Export loading and saving atoms
import { atom } from 'jotai';

/**
 * Atom for tracking loading state during operations
 */
export const isLoadingAtom = atom<boolean>(false);

/**
 * Atom for tracking saving state during operations
 */
export const isSavingAtom = atom<boolean>(false); 