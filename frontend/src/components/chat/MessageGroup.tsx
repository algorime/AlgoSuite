import React from 'react';
import { Island } from '../ui/Island.js';
import MessageBubble from './MessageBubble.js';
import type { Message } from '../../types/api.js';

interface MessageGroupProps {
  messages: Message[];
  timestamp: Date;
  showTimestamp?: boolean;
}

const MessageGroup: React.FC<MessageGroupProps> = ({ 
  messages, 
  timestamp, 
  showTimestamp = true 
}) => {
  if (messages.length === 0) return null;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="message-group mb-4">
      {showTimestamp && (
        <div className="flex justify-center mb-3">
          <Island
            variant="secondary"
            size="sm"
            elevation="none"
            className="timestamp-island"
            style={{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: '12px',
              padding: '4px 12px',
              opacity: 0.8,
            }}
          >
            <div 
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {formatTimestamp(timestamp)}
            </div>
          </Island>
        </div>
      )}
      
      <div className="space-y-1">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isGrouped={index > 0}
            showTimestamp={false}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageGroup;