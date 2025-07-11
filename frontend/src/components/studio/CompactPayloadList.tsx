import React, { useState } from 'react';
import type { PayloadSuggestion } from '../../types';

// Define the missing types locally
interface InjectionPoint {
  parameter: string;
  // Add other properties of InjectionPoint if available and needed
}

interface PayloadAnalysisResult {
  injection_points: InjectionPoint[];
  vulnerability_indicators?: string[];
  // Add other properties of PayloadAnalysisResult if available and needed
}
import Button from '../ui/Button';

interface CompactPayloadListProps {
  payloadSuggestions: PayloadSuggestion[];
  analysisResult: PayloadAnalysisResult | null;
  onPayloadApply: (payload: PayloadSuggestion, injectionPoint: InjectionPoint) => void;
  className?: string;
}

const CompactPayloadList: React.FC<CompactPayloadListProps> = ({
  payloadSuggestions,
  analysisResult,
  onPayloadApply,
  className = ''
}) => {
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null);
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

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

  const groupPayloadsByInjectionPoint = () => {
    return {
      general: payloadSuggestions
    };
  };

  const payloadGroups = groupPayloadsByInjectionPoint();

  return (
    <div className={`h-full bg-gray-800 rounded-lg p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Payload Suggestions</h3>
        <div className="text-sm text-gray-400">
          {payloadSuggestions.length > 0 
            ? `${payloadSuggestions.length} payloads available • Copy or apply directly`
            : 'No payloads generated yet'
          }
        </div>
      </div>

      {/* Analysis Summary */}
      {analysisResult && (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-600 mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Analysis Summary</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-blue-400 font-bold">
                {analysisResult.injection_points?.length || 0}
              </div>
              <div className="text-gray-400">Injection Points</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">
                {analysisResult.vulnerability_indicators?.length || 0}
              </div>
              <div className="text-gray-400">Indicators</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">
                {payloadSuggestions.length}
              </div>
              <div className="text-gray-400">Payloads</div>
            </div>
          </div>
        </div>
      )}

      {/* Payload Groups */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {Object.entries(payloadGroups).map(([injectionPoint, payloads]) => (
          <div key={injectionPoint} className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              {injectionPoint === 'general' ? 'General Payloads' : `Parameter: ${injectionPoint}`}
            </h4>
            
            <div className="space-y-2">
              {payloads.map((payload, index) => (
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
                        variant="primary"
                        onClick={() => handleApplyPayload(payload)}
                        disabled={!analysisResult?.injection_points?.length}
                        className="text-xs px-2 py-1"
                      >
                        Apply
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
          </div>
        ))}

        {/* Empty State */}
        {payloadSuggestions.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <div className="mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <p className="mb-2">No payload suggestions yet</p>
            <p className="text-sm">
              Start a chat analysis to generate SQL injection payloads
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-600">
        <div className="text-xs text-gray-400">
          <strong className="text-gray-300">💡 How to use:</strong>
          <br />• Click copy button to copy payload to clipboard
          <br />• Click apply button to insert payload into request
          <br />• Use chat to get specific recommendations
        </div>
      </div>
    </div>
  );
};

export default CompactPayloadList;