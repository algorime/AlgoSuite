import React, { useState } from 'react';
import { Island } from '../ui/Island.js';
import Button from '../ui/Button.js';
import Input from '../ui/Input.js';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Ask about SQL injection vulnerabilities...",
  className = ''
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`chat-input-container ${className}`}>
      <Island
        variant="primary"
        size="md"
        elevation="medium"
        className="chat-input-island"
        style={{
          backgroundColor: 'var(--color-island-background)',
          borderRadius: '24px',
          padding: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--color-island-border)',
          transition: 'all var(--transition-duration-normal) var(--transition-easing)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              variant="filled"
              size="md"
              elevation="none"
              className="chat-input-field"
              style={{
                backgroundColor: 'var(--color-background-secondary)',
                border: 'none',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.5',
                minHeight: '44px',
                maxHeight: '120px',
                resize: 'none',
                transition: 'all var(--transition-duration-fast) var(--transition-easing)',
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            variant="primary"
            size="md"
            elevation="low"
            className="chat-send-button"
            style={{
              borderRadius: '16px',
              minWidth: '60px',
              height: '44px',
              backgroundColor: input.trim() && !isLoading 
                ? 'var(--color-interactive-primary)' 
                : 'var(--color-interactive-secondary)',
              transition: 'all var(--transition-duration-fast) var(--transition-easing)',
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="m22 2-7 20-4-9-9-4z"/>
                <path d="M22 2 11 13"/>
              </svg>
            )}
          </Button>
        </form>
      </Island>
    </div>
  );
};

export default ChatInput;