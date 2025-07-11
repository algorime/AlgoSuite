import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { 
  HttpRequest, 
  HttpResponse, 
  PayloadSuggestion, 
  PayloadAnalysisResult,
  InjectionPoint,
  PayloadApplicatorResult
} from '../../types';
import PayloadSuggestorChat from './PayloadSuggestorChat';
import CompactPayloadList from './CompactPayloadList';
import PayloadApplicator from '../../services/PayloadApplicator';
import './StudioInterface.css';

interface StudioInterfaceProps {
  className?: string;
}

const StudioInterface: React.FC<StudioInterfaceProps> = ({ className = '' }) => {
  // HTTP Request/Response State
  const [httpRequest, setHttpRequest] = useState<HttpRequest>({
    method: 'GET',
    url: 'https://example.com/api/users?id=1',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: ''
  });
  
  const [httpResponse] = useState<HttpResponse>({
    status_code: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{"users": [{"id": 1, "name": "John Doe"}]}'
  });

  // Payload Analysis State
  const [payloadSuggestions, setPayloadSuggestions] = useState<PayloadSuggestion[]>([]);
  const [analysisResult, setAnalysisResult] = useState<PayloadAnalysisResult | null>(null);
  const [appliedPayloads, setAppliedPayloads] = useState<string[]>([]);
  const [applicationResult, setApplicationResult] = useState<PayloadApplicatorResult | null>(null);

  // UI State
  const [requestTextValue, setRequestTextValue] = useState('');
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [parseTimeoutId, setParseTimeoutId] = useState<number | null>(null);
  const [lastParsedValue, setLastParsedValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Event Handlers
  const handlePayloadSuggestions = (suggestions: PayloadSuggestion[]) => {
    setPayloadSuggestions(suggestions);
  };

  const handleAnalysisResult = (result: PayloadAnalysisResult) => {
    setAnalysisResult(result);
  };

  const handlePayloadApply = async (payload: PayloadSuggestion, injectionPoint: InjectionPoint) => {
    try {
      const result = await PayloadApplicator.applyPayload(httpRequest, payload, injectionPoint);
      
      if (result.success) {
        setHttpRequest(result.modified_request);
        setAppliedPayloads(prev => [...prev, payload.payload]);
        setApplicationResult(result);
        
        // Show success feedback
        console.log('Payload applied successfully:', result.preview);
      } else {
        console.error('Failed to apply payload:', result.error);
      }
    } catch (error) {
      console.error('Error applying payload:', error);
    }
  };

  const handleRequestChange = (field: keyof HttpRequest, value: string | Record<string, string>) => {
    setHttpRequest(prev => ({ ...prev, [field]: value }));
  };

  const buildHttpRequestString = useCallback(() => {
    const headerString = Object.entries(httpRequest.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `${httpRequest.method} ${httpRequest.url} HTTP/1.1\n${headerString}\n\n${httpRequest.body}`;
  }, [httpRequest]);

  // Initialize requestTextValue with the initial HTTP request
  useEffect(() => {
    const initialValue = buildHttpRequestString();
    setRequestTextValue(initialValue);
    setLastParsedValue(initialValue);
  }, [buildHttpRequestString]);

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
      
      // Only parse if we have a valid request line
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
      
      // Only update state if the request is actually different
      setHttpRequest(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newRequest)) {
          return newRequest;
        }
        return prev;
      });
    } catch (error) {
      // Don't update state if parsing fails
      console.warn('Failed to parse HTTP request:', error);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRequestTextValue(value);
    setIsManualEditing(true);
    
    // Clear any existing timeout
    if (parseTimeoutId) {
      clearTimeout(parseTimeoutId);
    }
    
    // Debounce parsing to avoid constant re-parsing - increased delay
    const newTimeoutId = setTimeout(() => {
      // Only parse if textarea is no longer focused or user has stopped typing
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
    // Allow normal keyboard behavior and prevent any external interference
    e.stopPropagation();
  };

  const handleTextareaFocus = () => {
    setIsManualEditing(true);
  };

  const handleTextareaBlur = () => {
    // Only stop manual editing if there's no pending parse operation
    if (!parseTimeoutId) {
      setIsManualEditing(false);
    }
  };

  // Update textarea value when httpRequest changes externally (not from manual editing or parsing)
  useEffect(() => {
    if (!isManualEditing && !parseTimeoutId) {
      const newRequestString = buildHttpRequestString();
      // Only update if the content is actually different and it's not from our own parsing
      if (newRequestString !== requestTextValue && newRequestString !== lastParsedValue) {
        // Preserve cursor position if textarea is focused
        const textarea = textareaRef.current;
        const selectionStart = textarea?.selectionStart || 0;
        const selectionEnd = textarea?.selectionEnd || 0;
        
        setRequestTextValue(newRequestString);
        setLastParsedValue(newRequestString);
        
        // Restore cursor position after a small delay to allow React to update
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
    <div className={`w-full h-screen flex flex-col ${className}`}>
      {/* Main Studio Container */}
      <div className="bg-gray-900 rounded-2xl flex-1 min-h-0 flex flex-col">
        <div className="flex-1 p-6 min-h-0 flex flex-col">
          <PanelGroup direction="horizontal" className="w-full h-full flex-1">
            {/* HTTP Request/Response Panel */}
            <Panel defaultSize={35} minSize={25}>
              <div className="h-full bg-gray-800 rounded-lg p-4 flex flex-col mr-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">HTTP Request/Response</h3>
                </div>
                
                <PanelGroup direction="vertical" className="flex-1">
                  {/* Request Editor */}
                  <Panel defaultSize={50}>
                    <div className="h-full flex flex-col">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-300">Request</h4>
                        <select 
                          value={httpRequest.method}
                          onChange={(e) => handleRequestChange('method', e.target.value)}
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
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Response</h4>
                      <div className="flex-1 bg-gray-900 border border-gray-600 rounded p-3 min-h-0 overflow-y-auto">
                        <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                          {buildHttpResponseString()}
                        </pre>
                      </div>
                    </div>
                  </Panel>
                </PanelGroup>
              </div>
            </Panel>

            <PanelResizeHandle>
              <div className="w-3 h-full flex items-center justify-center cursor-col-resize group">
                <div className="w-1 h-10 bg-gray-600 rounded-full group-hover:bg-blue-500 transition-colors"></div>
              </div>
            </PanelResizeHandle>

            {/* Chat Panel */}
            <Panel defaultSize={35} minSize={25}>
              <div className="h-full mr-2 ml-2">
                <PayloadSuggestorChat
                  httpRequest={httpRequest}
                  httpResponse={httpResponse}
                  onPayloadSuggestions={handlePayloadSuggestions}
                  onAnalysisResult={handleAnalysisResult}
                  className="h-full"
                />
              </div>
            </Panel>

            <PanelResizeHandle>
              <div className="w-3 h-full flex items-center justify-center cursor-col-resize group">
                <div className="w-1 h-10 bg-gray-600 rounded-full group-hover:bg-blue-500 transition-colors"></div>
              </div>
            </PanelResizeHandle>

            {/* Payload Suggestions Panel */}
            <Panel defaultSize={30} minSize={20}>
              <div className="h-full ml-2">
                <CompactPayloadList
                  payloadSuggestions={payloadSuggestions}
                  analysisResult={analysisResult}
                  onPayloadApply={handlePayloadApply}
                  className="h-full"
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-900 flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-6">
          <span className="flex items-center">
            <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
            Ready
          </span>
          <span>
            Payloads: {payloadSuggestions.length}
          </span>
          <span>
            Injection Points: {analysisResult?.injection_points?.length || 0}
          </span>
          <span>
            Applied: {appliedPayloads.length}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs">
            {applicationResult ? `Last applied: ${applicationResult.applied_payload.payload.type}` : 'No payload applied'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudioInterface;