import React from 'react';
import { Island } from '../ui/Island.js';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-start mb-2 ${className}`}>
      <div className="max-w-[80%] mt-3">
        <Island
          variant="secondary"
          size="sm"
          elevation="low"
          className="typing-indicator"
          style={{
            backgroundColor: 'var(--color-island-background)',
            borderRadius: '18px',
            padding: '12px 16px',
            transition: 'all var(--transition-duration-fast) var(--transition-easing)',
          }}
        >
          <div className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: 'var(--color-text-secondary)',
                animationDelay: '0ms',
                animationDuration: '1.4s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: 'var(--color-text-secondary)',
                animationDelay: '200ms',
                animationDuration: '1.4s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: 'var(--color-text-secondary)',
                animationDelay: '400ms',
                animationDuration: '1.4s'
              }}
            />
          </div>
        </Island>
      </div>
    </div>
  );
};

export default TypingIndicator;