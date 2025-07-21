import React from 'react';
import EditorIsland from './EditorIsland.js';

interface EditorIslandWrapperProps {
  className?: string;
  isLoading?: boolean;
  onExecute?: (payload: string, language: string) => void;
}

const EditorIslandWrapper: React.FC<EditorIslandWrapperProps> = ({ 
  className = '',
  isLoading = false,
  onExecute
}) => {
  // Handle the legacy onExecute signature
  const handleExecute = (content: string, language: string) => {
    if (onExecute) {
      // For backward compatibility, call with just the payload content
      onExecute(content, language);
    }
  };

  if (isLoading) {
    return (
      <div className={`editor-loading-container ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <EditorIsland
      className={className}
      onExecute={handleExecute}
    />
  );
};

export default EditorIslandWrapper;