import React, { useState, useEffect, useRef } from 'react';
import { CodeEditor } from './CodeEditor';
import { updateProjectCode, deleteProjectCode } from '../../../../../client/sdk.gen';
import { useProject, useCode, useStlData } from '~/app/atoms';
import { v4 as uuidv4 } from 'uuid';
import { generateStl } from '../js-to-stl-logic/StlExporter';

export function Editor() {
  const { code, setCode } = useCode();
  const { project } = useProject();
  const { setStl } = useStlData();
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to update code on the server asynchronously
  const updateCodeOnServer = (codeContent: string, objectId?: string, filename?: string, filepath?: string) => {
    if (!project) return;
    
    updateProjectCode({
      path: { projectId: project.id },
      body: { 
        object: codeContent,
        id: objectId,
        filename: filename,
        filepath: filepath
      }
    }).then(response => {
      // Optionally update with server data if needed
      if (response.data?.object && response.data.object.id && !response.data.object.id.startsWith('temp-')) {
        // Only update if we got a real ID back
        const currentCode = [...code];
        const index = currentCode.findIndex(obj => obj.id && (obj.id === objectId || obj.id.startsWith('temp-')));
        
        if (index !== -1) {
          currentCode[index] = response.data.object;
          setCode(currentCode);
        }
      }
    }).catch(error => {
      console.error('Error saving code:', error);
      // Could add error handling UI here
    });
  };

  const saveCode = async (newCodeContent: string, index: number) => {
    if (!project) return;
    
    // Update the code at the specific index immediately for responsive UI
    const updatedCode = [...code];
    
    // If the code object already exists, update it
    if (updatedCode[index]) {
      updatedCode[index] = {
        ...updatedCode[index],
        object: newCodeContent,
        updated_at: new Date().toISOString() // Update the timestamp
      };
      // Preserve existing filename and filepath if they exist
    } else {
      // Create a new code object if it doesn't exist
      const filename = `code_${index + 1}.js`;
      const filepath = `/project/${project.id}/`;
      updatedCode[index] = {
        id: `temp-${Date.now()}`, // Temporary ID until saved on server
        object: newCodeContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: project.id,
        filename: filename,
        filepath: filepath
      };
    }
    
    // Update the UI immediately
    setCode(updatedCode);

    // Update the server in the background
    updateCodeOnServer(
      newCodeContent, 
      updatedCode[index]?.id, 
      updatedCode[index]?.filename, 
      updatedCode[index]?.filepath
    );
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setDropdownOpen(null); // Close dropdown when changing tabs
  };

  const handleAddTab = () => {
    if (!project) return;
    
    const newId = uuidv4();
    const filename = `code_${code.length + 1}.js`;
    const filepath = `/project/${project.id}/`;
    const newCodeObject = {
      id: newId,
      object: '// New code file',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: project.id,
      filename: filename,
      filepath: filepath
    };
    const updatedCode = [...code, newCodeObject];
    setCode(updatedCode);
    setActiveTab(code.length); // Set the active tab to the new tab
    
    // Save the new object to the server with the UUID
    updateCodeOnServer('// New code file', newId, filename, filepath);
  };

  const handleRemoveTab = async (indexToRemove: number) => {
    if (code.length <= 1 || !project) return; // Don't remove the last tab

    const removedCode = code[indexToRemove];

    if(!removedCode.id) return;

    await deleteProjectCode({
      path : { objectId : removedCode.id }
    })
    
    const newCode = code.filter((_, index: number) => index !== indexToRemove);
    setCode(newCode);
    
    // Adjust the active tab if necessary
    if (activeTab >= indexToRemove && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleRename = (index: number, newName: string) => {
    if (!project) return;
    
    const updatedCode = [...code];
    const fileToRename = updatedCode[index];
    
    if (fileToRename && fileToRename.id && fileToRename.object) {
      // Update the filename
      fileToRename.filename = newName;
      
      // Update the UI immediately
      setCode(updatedCode);
      
      // Update the server
      updateCodeOnServer(
        fileToRename.object,
        fileToRename.id,
        newName,
        fileToRename.filepath || `/project/${project.id}/`
      );
    }
  };

  const handleTabNameEdit = (index: number, event: React.FormEvent<HTMLSpanElement>) => {
    const newName = event.currentTarget.textContent || '';
    if (newName.trim()) {
      handleRename(index, newName.trim());
    }
  };
  
  // Initialize StlExporter and generate STL when code changes
  useEffect(() => {
    if (!project) return;

    if (code && code.length > 0) {
      let combinedCode = "";

      for (let c of code){
        combinedCode += c.object + "\n";
      }

      generateStl(combinedCode).then((stlData) => {
        setStl(stlData);
      });
    }
  }, [code, project]);

  return (
    <div className="border-t border-gray-200">
      <div className="bg-gray-50 px-4 py-2 flex items-center">
        <div className="flex-1 flex space-x-1 overflow-x-auto">
          {code.map((codeObj, index: number) => (
            <div key={index} className="relative flex items-center">
              <button
                className={`px-3 py-1 text-sm font-medium rounded-t-md flex items-center space-x-1 ${
                  activeTab === index
                    ? 'bg-white text-blue-600 border border-gray-200 border-b-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange(index)}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTabNameEdit(index, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  className="outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                >
                  {codeObj.filename}
                </span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handleAddTab}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Add new file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          {code.length > 1 && (
            <button
              onClick={() => handleRemoveTab(activeTab)}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="Remove current file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {code.length > 0 && project && (
        <CodeEditor
          code={code[activeTab]?.object || ''}
          onCodeChange={(newCode: string) => saveCode(newCode, activeTab)}
        />
      )}
    </div>
  );
}