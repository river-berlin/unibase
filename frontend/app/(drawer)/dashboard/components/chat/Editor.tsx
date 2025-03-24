import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { updateProjectCode } from '../../../../../client/sdk.gen';
import { useProject, useCode } from '~/app/atoms';
import { v4 as uuidv4 } from 'uuid';

export function Editor() {
  const { code, setCode } = useCode();
  const { project } = useProject();
  const [activeTab, setActiveTab] = useState(0);

  if (!project) return null;

  // Function to update code on the server asynchronously
  const updateCodeOnServer = (codeContent: string, objectId?: string) => {
    console.log("--- project id is", project.id)
    updateProjectCode({
      path: { projectId: project.id },
      body: { 
        object: codeContent,
        id: objectId
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
    // Update the code at the specific index immediately for responsive UI
    const updatedCode = [...code];
    
    // If the code object already exists, update it
    if (updatedCode[index]) {
      updatedCode[index] = {
        ...updatedCode[index],
        object: newCodeContent,
        updated_at: new Date().toISOString() // Update the timestamp
      };
    } else {
      // Create a new code object if it doesn't exist
      updatedCode[index] = {
        id: `temp-${Date.now()}`, // Temporary ID until saved on server
        object: newCodeContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: project.id
      };
    }
    
    // Update the UI immediately
    setCode(updatedCode);

    // Update the server in the background
    updateCodeOnServer(newCodeContent, updatedCode[index]?.id);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleAddTab = () => {
    const newId = uuidv4();
    const newCodeObject = {
      id: newId,
      object: '// New code file',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: project.id
    };
    setCode([...code, newCodeObject]);
    setActiveTab(code.length); // Set the active tab to the new tab
    
    // Save the new object to the server with the UUID
    updateCodeOnServer('// New code file', newId);
  };

  const handleRemoveTab = (indexToRemove: number) => {
    if (code.length <= 1) return; // Don't remove the last tab
    
    const newCode = code.filter((_, index: number) => index !== indexToRemove);
    setCode(newCode);
    
    // Adjust the active tab if necessary
    if (activeTab >= indexToRemove && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="border-t border-gray-200">
      <div className="bg-gray-50 px-4 py-2 flex items-center">
        <div className="flex-1 flex space-x-1 overflow-x-auto">
          {code.map((_, index: number) => (
            <button
              key={index}
              className={`px-3 py-1 text-sm font-medium rounded-t-md ${
                activeTab === index
                  ? 'bg-white text-blue-600 border border-gray-200 border-b-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleTabChange(index)}
            >
              {`File ${index + 1}`}
            </button>
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
      
      {code.length > 0 && (
        <CodeEditor
          code={code[activeTab].object || ''}
          onCodeChange={(newCode: string) => saveCode(newCode, activeTab)}
        />
      )}
    </div>
  );
} 