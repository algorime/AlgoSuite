import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { agentApi } from '../../lib/api';
import type { Message, ChatState } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation({
    mutationFn: agentApi.sendMessage,
    onMutate: () => {
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
      
      setInput('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !chatState.isLoading) {
      sendMessageMutation.mutate(input.trim());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="border-b bg-white/95 dark:bg-gray-800/95 backdrop-blur p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AlgoBrain Assistant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered penetration testing assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatState.messages.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Welcome to AlgoBrain</h3>
                <p>Start by asking about SQL injection vulnerabilities or web security assessments.</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {chatState.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {chatState.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">●</div>
                <div className="animate-pulse delay-75">●</div>
                <div className="animate-pulse delay-150">●</div>
              </div>
            </div>
          </div>
        )}
        
        {chatState.error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-lg p-3">
              Error: {chatState.error}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white/95 dark:bg-gray-800/95 backdrop-blur p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SQL injection vulnerabilities..."
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={chatState.isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || chatState.isLoading}
            isLoading={chatState.isLoading}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;