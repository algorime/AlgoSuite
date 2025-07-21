import React from 'react';
import { ContentIsland } from '../ui/ContentIsland.js';
import ChatInterface from './ChatInterface.js';

interface ChatIslandWrapperProps {
  className?: string;
  isLoading?: boolean;
}

const ChatIslandWrapper: React.FC<ChatIslandWrapperProps> = ({ 
  className = '',
  isLoading = false 
}) => {
  return (
    <ContentIsland
      contentType="chat"
      title="AlgoBrain Assistant"
      fillHeight={true}
      isLoading={isLoading}
      className={`chat-island-wrapper ${className}`}
      headerContent={
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--color-success)' }}
          ></div>
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Online
          </span>
        </div>
      }
      showTransitions={true}
    >
      <ChatInterface className="h-full" />
    </ContentIsland>
  );
};

export default ChatIslandWrapper;