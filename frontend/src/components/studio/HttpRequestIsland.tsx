import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Island } from '../ui/Island.js';
import type { HttpRequest, HttpResponse, PayloadApplicatorResult } from '../../types';

interface HttpRequestIslandProps {
  httpRequest: HttpRequest;
  httpResponse: HttpResponse;
  applicationResult: PayloadApplicatorResult | null;
  onRequestChange: (field: keyof HttpRequest, value: string | Record<string, string>) => void;
  className?: string;
}

const HttpRequestIsland: React.FC<HttpRequestIslandProps> = ({
  httpRequest,
  httpResponse,
  applicationResult,
  onRequestChange,
  className = ''
}) => {
  const [requestTextValue, setRequestTextValue] = useState('');
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [parseTimeoutId, setParseTimeoutId] = useState<number | null>(null);
  const [lastParsedValue, setLastParsedValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const buildHttpRequestString = useCallback(() => {
    const headerString = Object.entries(httpRequest.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `${httpRequest.method} ${httpRequest.url} HTTP/1.1\n${headerString}\n\n${httpRequest.body}`;
  }, [httpRequest]);

  const buildHttpResponseString = () => {
    const headerString = Object.entries(httpResponse.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `HTTP/1.1 ${httpResponse.status_code} OK\n${headerString}\n\n${httpResponse.body}`;
  };

  const parseHttpRequest = (requestString: string) => {
    try {
      const lines = requestString.split('\n');
      if (lines.length === 0) return;
      
      const requestLine = lines[0];
      const [method, url] = requestLine.split(' ');
      
      if (!method || !url) return;
      
      const headers: Record<string, string> = {};
      let bodyStartIndex = -1;
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') {
          bodyStartIndex = i + 1;
          break;
        }
        const [key, ...valueParts] = lines[i].split(':');
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join(':').trim();
        }
      }
      
      const body = bodyStartIndex >= 0 ? lines.slice(bodyStartIndex).join('\n') : '';
      
      const newRequest = { method: method || 'GET', url: url || '', headers, body };
      
      if (JSON.stringify(httpRequest) !== JSON.stringify(newRequest)) {
        onRequestChange('method', newRequest.method);
        onRequestChange('url', newRequest.url);
        onRequestChange('headers', newRequest.headers);
        onRequestChange('body', newRequest.body);
      }
    } catch (error) {
      console.warn('Failed to parse HTTP request:', error);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRequestTextValue(value);
    setIsManualEditing(true);
    
    if (parseTimeoutId) {
      clearTimeout(parseTimeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) {
        parseHttpRequest(value);
        setLastParsedValue(value);
      }
      setIsManualEditing(false);
      setParseTimeoutId(null);
    }, 1000);
    
    setParseTimeoutId(newTimeoutId);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const handleTextareaFocus = () => {
    setIsManualEditing(true);
  };

  const handleTextareaBlur = () => {
    if (!parseTimeoutId) {
      setIsManualEditing(false);
    }
  };

  // Initialize requestTextValue with the initial HTTP request
  useEffect(() => {
    const initialValue = buildHttpRequestString();
    setRequestTextValue(initialValue);
    setLastParsedValue(initialValue);
  }, [buildHttpRequestString]);

  // Update textarea value when httpRequest changes externally
  useEffect(() => {
    if (!isManualEditing && !parseTimeoutId) {
      const newRequestString = buildHttpRequestString();
      if (newRequestString !== requestTextValue && newRequestString !== lastParsedValue) {
        const textarea = textareaRef.current;
        const selectionStart = textarea?.selectionStart || 0;
        const selectionEnd = textarea?.selectionEnd || 0;
        
        setRequestTextValue(newRequestString);
        setLastParsedValue(newRequestString);
        
        if (textarea && document.activeElement === textarea) {
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart, selectionEnd);
          }, 0);
        }
      }
    }
  }, [httpRequest, isManualEditing, parseTimeoutId, buildHttpRequestString, requestTextValue, lastParsedValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (parseTimeoutId) {
        clearTimeout(parseTimeoutId);
      }
    };
  }, [parseTimeoutId]);

  return (
    <Island
      variant="secondary"
      elevation="medium"
      size="md"
      className={`h-full ${className}`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">HTTP Request/Response</h3>
        </div>
        
        <PanelGroup direction="vertical" className="flex-1">
          {/* Request Editor */}
          <Panel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="flex items-center mb-2">
                <h4 className="text-sm font-medium opacity-80">Request</h4>
                <select 
                  value={httpRequest.method}
                  onChange={(e) => onRequestChange('method', e.target.value)}
                  className="ml-2 bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-600 rounded p-3 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={requestTextValue}
                  onChange={handleTextareaChange}
                  onKeyDown={handleTextareaKeyDown}
                  onFocus={handleTextareaFocus}
                  onBlur={handleTextareaBlur}
                  className="w-full h-full bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                  placeholder="HTTP request will appear here..."
                  spellCheck={false}
                />
                {applicationResult && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-600 rounded text-green-300 text-xs">
                    ✓ Applied: {applicationResult.preview}
                  </div>
                )}
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle>
            <div className="h-3 flex items-center justify-center cursor-row-resize group">
              <div className="w-10 h-1 bg-gray-600 rounded-full group-hover:bg-blue-500 transition-colors"></div>
            </div>
          </PanelResizeHandle>
          
          {/* Response Viewer */}
          <Panel defaultSize={50}>
            <div className="h-full flex flex-col">
              <h4 className="text-sm font-medium opacity-80 mb-2">Response</h4>
              <div className="flex-1 bg-gray-900 border border-gray-600 rounded p-3 min-h-0 overflow-y-auto">
                <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                  {buildHttpResponseString()}
                </pre>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </Island>
  );
};

export default HttpRequestIsland;