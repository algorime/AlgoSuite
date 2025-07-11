import React, { useState, useRef, useEffect } from 'react';
import type {
  Message,
  HttpRequest,
  HttpResponse,
  PayloadSuggestion,
} from '../../types';
import Button from '../ui/Button';
import api from '../../lib/api';

interface PayloadSuggestorChatProps {
  httpRequest: HttpRequest;
  httpResponse: HttpResponse;
  onPayloadSuggestions: (suggestions: PayloadSuggestion[]) => void;
  className?: string;
}

const PayloadSuggestorChat: React.FC<PayloadSuggestorChatProps> = ({
  httpRequest,
  httpResponse,
  onPayloadSuggestions,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string, type?: 'text' | 'code' | 'vulnerability') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type: type || 'text'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendPayloadAnalysisRequest = async (userMessage?: string) => {
    if (!httpRequest.url && !httpResponse.body) {
      addMessage('assistant', 'Please provide HTTP request/response data to analyze for SQL injection opportunities.');
      return;
    }

    setIsLoading(true);

    if (userMessage) {
      addMessage('user', userMessage);
    }

    try {
      const requestBody = {
        request: httpRequest,
        user_message: userMessage || 'Analyze this request for SQL injection vulnerabilities and suggest payloads.',
        db_type: "Unknown",
      };

      const response = await api.post('/payload-suggestor/invoke/v2', requestBody);

      const suggestions: PayloadSuggestion[] = response.data;
      
      onPayloadSuggestions(suggestions);

      const agentMessage = `Found ${suggestions.length} potential payload suggestions.`;
      addMessage('assistant', agentMessage, 'vulnerability');

    } catch (error) {
      console.error('Error communicating with payload suggestor agent:', error);
      addMessage('assistant', `Error: ${error instanceof Error ? error.message : 'Failed to analyze request/response data'}`, 'text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      sendPayloadAnalysisRequest(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAnalysis = () => {
    sendPayloadAnalysisRequest();
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : message.type === 'vulnerability'
              ? 'bg-red-900 border border-red-700 text-red-100'
              : message.type === 'code'
                ? 'bg-gray-800 border border-gray-600 text-green-400 font-mono text-sm'
                : 'bg-gray-700 text-gray-100'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Payload Suggestor Agent</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isLoading ? 'Analyzing...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="mb-4">Ready to analyze HTTP requests for SQL injection opportunities!</p>
            <Button 
              onClick={handleQuickAnalysis}
              disabled={!httpRequest.url && !httpResponse.body}
              className="mx-auto"
            >
              Start Analysis
            </Button>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about specific injection points, payload types, or request analysis..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-[60px]"
            rows={2}
            disabled={isLoading}
          />
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="h-[60px] px-4"
            >
              Send
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PayloadSuggestorChat;