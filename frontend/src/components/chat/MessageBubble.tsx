import React from 'react';
import { Island } from '../ui/Island.js';
import type { Message } from '../../types/api.js';

interface MessageBubbleProps {
  message: Message;
  isGrouped?: boolean;
  showTimestamp?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isGrouped = false,
  showTimestamp = true 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[80%] ${isGrouped ? 'mt-1' : 'mt-3'}`}>
        <Island
          variant={isUser ? 'primary' : 'secondary'}
          size="sm"
          elevation="low"
          className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'}`}
          style={{
            backgroundColor: isUser 
              ? 'var(--color-interactive-primary)' 
              : 'var(--color-island-background)',
            color: isUser 
              ? 'white' 
              : 'var(--color-text-primary)',
            borderRadius: '18px',
            padding: '12px 16px',
            maxWidth: '100%',
            wordWrap: 'break-word',
            transition: 'all var(--transition-duration-fast) var(--transition-easing)',
          }}
        >
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </div>
          {showTimestamp && (
            <div 
              className="text-xs mt-2 opacity-70"
              style={{ 
                color: isUser ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-text-secondary)' 
              }}
            >
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </Island>
      </div>
    </div>
  );
};

export default MessageBubble;