import React, { useState, useRef, useEffect } from 'react';
import type {
  Message,
  HttpRequest,
  HttpResponse,
  PayloadSuggestion,
  PayloadAnalysisResult,
  InjectionPoint
} from '../../types';
import Button from '../ui/Button';
import api from '../../lib/api';

interface PayloadSuggestionPanelProps {
  httpRequest: HttpRequest;
  httpResponse: HttpResponse;
  onPayloadApply: (payload: PayloadSuggestion, injectionPoint: InjectionPoint) => void;
  onPayloadSave: (payload: PayloadSuggestion) => void;
  className?: string;
}

const PayloadSuggestionPanel: React.FC<PayloadSuggestionPanelProps> = ({
  httpRequest,
  httpResponse,
  onPayloadApply,
  onPayloadSave,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [payloadSuggestions, setPayloadSuggestions] = useState<PayloadSuggestion[]>([]);
  const [analysisResult, setAnalysisResult] = useState<PayloadAnalysisResult | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null);
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    addMessage('assistant', 'Here is a sample payload to get you started:');
    setPayloadSuggestions([
      {
        payload: "' OR 1=1 --",
        type: 'boolean_blind',
        risk_level: 'high',
        description: 'A simple boolean-based blind SQL injection payload.',
        source: 'Manual',
        expected_result: 'The query should return true, potentially bypassing authentication or returning all records.'
      }
    ]);
  }, []);

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
      
      setPayloadSuggestions(suggestions);

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boolean_blind': return 'bg-blue-600';
      case 'union_based': return 'bg-purple-600';
      case 'time_based': return 'bg-orange-600';
      case 'error_based': return 'bg-red-600';
      case 'stacked_queries': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const copyToClipboard = async (payload: string) => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedPayload(payload);
      setTimeout(() => setCopiedPayload(null), 2000);
    } catch (err) {
      console.error('Failed to copy payload:', err);
    }
  };

  const handleApplyPayload = (payload: PayloadSuggestion) => {
    const injectionPoint = analysisResult?.injection_points?.[0];
    if (injectionPoint) {
      onPayloadApply(payload, injectionPoint);
    }
  };

  const toggleSource = (index: number) => {
    setExpandedSource(expandedSource === index ? null : index);
  };

  const truncatePayload = (payload: string, maxLength: number = 50) => {
    return payload.length > maxLength ? payload.substring(0, maxLength) + '...' : payload;
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

  const renderPayloads = () => {
    return (
      <div className="space-y-2">
        {payloadSuggestions.map((payload, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-700 rounded p-2 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded text-white ${getTypeColor(payload.type)}`}>
                  {payload.type ? payload.type.replace('_', ' ') : 'General'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getRiskColor(payload.risk_level)}`}>
                  {payload.risk_level}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => copyToClipboard(payload.payload)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Copy payload"
                >
                  {copiedPayload === payload.payload ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onPayloadSave(payload)}
                  className="text-xs px-2 py-1"
                >
                  Save
                </Button>
              </div>
            </div>
            
            <div className="font-mono text-xs text-green-400 bg-black/30 p-2 rounded mb-2">
              {expandedPayload === payload.payload 
                ? payload.payload 
                : truncatePayload(payload.payload)}
              {payload.payload.length > 50 && (
                <button
                  onClick={() => setExpandedPayload(
                    expandedPayload === payload.payload ? null : payload.payload
                  )}
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  {expandedPayload === payload.payload ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-400 mb-2">
              {payload.description}
            </div>
            
            {payload.source && (
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSource(index);
                  }}
                  className="text-xs text-blue-400 hover:underline focus:outline-none"
                >
                  {expandedSource === index ? 'Hide' : 'Show'} Source
                </button>
                {expandedSource === index && (
                  <div className="mt-2 p-2 bg-black/30 rounded text-xs text-gray-300 whitespace-pre-wrap">
                    {payload.source}
                  </div>
                )}
              </div>
            )}
            
            {payload.expected_result && (
              <div className="text-xs text-blue-400 mt-1">
                Expected: {payload.expected_result}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Payload Suggestor</h3>
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
            {payloadSuggestions.length > 0 && renderPayloads()}
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

export default PayloadSuggestionPanel;