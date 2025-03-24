import React, { useState, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
}

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleCodeChange = useCallback((newCode: string) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      onCodeChange(newCode);
      setIsSaving(false);
    }, 1000);
  }, [onCodeChange]);

  return (
    <>
      {isSaving && (
        <div className="bg-gray-50 px-4 py-1 flex justify-end">
          <span className="text-xs text-gray-500">Saving...</span>
        </div>
      )}
      <CodeMirror
        value={code}
        height="400px"
        theme="light"
        extensions={[javascript()]}
        onChange={handleCodeChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        style={{
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        }}
      />
    </>
  );
} 