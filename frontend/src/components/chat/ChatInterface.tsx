import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { agentApi } from '../../lib/api';
import type { Message, ChatState } from '../../types/api';
import MessageGroup from './MessageGroup';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import WelcomeMessage from './WelcomeMessage';
import { Island } from '../ui/Island';
import './ChatIsland.css';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation({
    mutationFn: agentApi.sendMessage,
    onMutate: (input: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date(),
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: undefined,
      }));
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    },
    onError: (error: Error) => {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    },
  });

  const handleSendMessage = (message: string) => {
    if (message.trim() && !chatState.isLoading) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Group messages by time intervals (5 minutes)
  const groupMessages = (messages: Message[]) => {
    const groups: { timestamp: Date; messages: Message[] }[] = [];
    const groupInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

    messages.forEach((message) => {
      const lastGroup = groups[groups.length - 1];
      
      if (
        !lastGroup ||
        message.timestamp.getTime() - lastGroup.timestamp.getTime() > groupInterval
      ) {
        groups.push({
          timestamp: message.timestamp,
          messages: [message],
        });
      } else {
        lastGroup.messages.push(message);
      }
    });

    return groups;
  };

  const messageGroups = groupMessages(chatState.messages);

  return (
    <div className={`flex flex-col h-full chat-interface ${className}`}>
      {/* Messages Container with smooth scrolling */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          scrollBehavior: 'smooth',
          scrollPaddingTop: '20px',
          scrollPaddingBottom: '20px',
        }}
      >
        {/* Welcome Message */}
        {chatState.messages.length === 0 && (
          <WelcomeMessage />
        )}
        
        {/* Message Groups */}
        {messageGroups.map((group, index) => (
          <MessageGroup
            key={`group-${index}-${group.timestamp.getTime()}`}
            messages={group.messages}
            timestamp={group.timestamp}
            showTimestamp={index === 0 || 
              (index > 0 && 
                group.timestamp.getTime() - messageGroups[index - 1].timestamp.getTime() > 30 * 60 * 1000) // Show timestamp if more than 30 minutes apart
            }
          />
        ))}
        
        {/* Typing Indicator */}
        {chatState.isLoading && (
          <TypingIndicator />
        )}
        
        {/* Error Message */}
        {chatState.error && (
          <div className="flex justify-center mb-4">
            <Island
              variant="danger"
              size="md"
              elevation="low"
              className="error-message-island"
              style={{
                backgroundColor: 'var(--color-background-danger)',
                borderRadius: '16px',
                padding: '12px 16px',
                border: '1px solid var(--color-border-danger)',
              }}
            >
              <div 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-danger)' }}
              >
                Error: {chatState.error}
              </div>
            </Island>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="px-4 pb-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={chatState.isLoading}
          placeholder="Ask about SQL injection vulnerabilities..."
        />
      </div>
    </div>
  );
};

export default ChatInterface;