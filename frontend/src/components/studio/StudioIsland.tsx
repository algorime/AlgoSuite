import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { 
  HttpRequest, 
  HttpResponse, 
  PayloadSuggestion, 
  PayloadAnalysisResult,
  InjectionPoint,
  PayloadApplicatorResult
} from '../../types';
import HttpRequestIsland from './HttpRequestIsland.js';
import PayloadSuggestionIsland from './PayloadSuggestionIsland.js';
import SavedPayloadsIsland from './SavedPayloadsIsland.js';
import StatusIsland from './StatusIsland.js';
import PayloadApplicator from '../../services/PayloadApplicator';

interface StudioIslandProps {
  className?: string;
}

const StudioIsland: React.FC<StudioIslandProps> = ({ className = '' }) => {
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
  const [savedPayloads, setSavedPayloads] = useState<PayloadSuggestion[]>([]);
  const [isSavedPayloadsOpen, setIsSavedPayloadsOpen] = useState(false);

  const handlePayloadApply = async (payload: PayloadSuggestion, injectionPoint: InjectionPoint) => {
    try {
      const result = await PayloadApplicator.applyPayload(httpRequest, payload, injectionPoint);
      
      if (result.success) {
        setHttpRequest(result.modified_request);
        setAppliedPayloads(prev => [...prev, payload.payload]);
        setApplicationResult(result);
        
        console.log('Payload applied successfully:', result.preview);
      } else {
        console.error('Failed to apply payload:', result.error);
      }
    } catch (error) {
      console.error('Error applying payload:', error);
    }
  };

  const handlePayloadSave = (payload: PayloadSuggestion) => {
    setSavedPayloads(prev => [...prev, payload]);
  };

  const handlePayloadUnsave = (payload: PayloadSuggestion) => {
    setSavedPayloads(prev => prev.filter(p => p.payload !== payload.payload));
  };

  const handleCopyPayload = async (payload: string) => {
    try {
      await navigator.clipboard.writeText(payload);
    } catch (err) {
      console.error('Failed to copy payload:', err);
    }
  };

  const handleRequestChange = (field: keyof HttpRequest, value: string | Record<string, string>) => {
    setHttpRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenSavedPayloads = () => {
    setIsSavedPayloadsOpen(true);
  };

  const handleCloseSavedPayloads = () => {
    setIsSavedPayloadsOpen(false);
  };

  return (
    <div className={`w-full h-full flex flex-col relative ${className}`}>
      {/* Main Studio Container with Islands */}
      <div className="flex-1 min-h-0 p-6">
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* HTTP Request/Response Island */}
          <Panel defaultSize={35} minSize={25}>
            <div className="h-full pr-3">
              <HttpRequestIsland
                httpRequest={httpRequest}
                httpResponse={httpResponse}
                applicationResult={applicationResult}
                onRequestChange={handleRequestChange}
                className="h-full"
              />
            </div>
          </Panel>

          <PanelResizeHandle>
            <div className="w-3 h-full flex items-center justify-center cursor-col-resize group">
              <div className="w-1 h-10 bg-gray-600 rounded-full group-hover:bg-blue-500 transition-colors"></div>
            </div>
          </PanelResizeHandle>

          {/* Payload Suggestion Island */}
          <Panel defaultSize={65} minSize={45}>
            <div className="h-full pl-3">
              <PayloadSuggestionIsland
                httpRequest={httpRequest}
                httpResponse={httpResponse}
                onPayloadApply={handlePayloadApply}
                onPayloadSave={handlePayloadSave}
                className="h-full"
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Floating Saved Payloads Island */}
      {isSavedPayloadsOpen && (
        <SavedPayloadsIsland
          savedPayloads={savedPayloads}
          onUnsave={handlePayloadUnsave}
          onCopy={handleCopyPayload}
          onClose={handleCloseSavedPayloads}
        />
      )}

      {/* Floating Status Island */}
      <StatusIsland
        payloadSuggestions={payloadSuggestions}
        analysisResult={analysisResult}
        appliedPayloads={appliedPayloads}
        applicationResult={applicationResult}
        savedPayloads={savedPayloads}
        onOpenSavedPayloads={handleOpenSavedPayloads}
      />
    </div>
  );
};

export default StudioIsland;