import React, { useState } from 'react';
import type { PayloadSuggestion } from '../../types';

interface PayloadSuggestionPanelProps {
  payloadSuggestions: PayloadSuggestion[];
  onPayloadSelect: (payload: PayloadSuggestion) => void;
  onPayloadDragStart: (payload: PayloadSuggestion, index: number) => void;
  className?: string;
}

const PayloadSuggestionPanel: React.FC<PayloadSuggestionPanelProps> = ({
  payloadSuggestions,
  onPayloadSelect,
  onPayloadDragStart,
  className = ''
}) => {
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

  const toggleSource = (index: number) => {
    setExpandedSource(expandedSource === index ? null : index);
  };

  return (
    <div className={`h-full bg-gray-800 rounded-lg p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Payload Suggestions</h3>
        <div className="text-sm text-gray-400">
          {payloadSuggestions.length > 0
            ? `${payloadSuggestions.length} payloads available • Drag to request editor`
            : 'No payloads generated yet'
          }
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Payload Suggestions */}
        {payloadSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Suggested Payloads</h4>
            <div className="space-y-3">
              {payloadSuggestions.map((payload, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => onPayloadDragStart(payload, index)}
                  onClick={() => onPayloadSelect(payload)}
                  className="bg-gray-900 border border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-800 hover:border-gray-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Drag to editor
                    </div>
                  </div>
                  
                  <div className="font-mono text-sm text-green-400 bg-black/30 p-2 rounded mb-2">
                    {payload.payload}
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    {payload.description}
                  </div>

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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {payloadSuggestions.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <div className="mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <p className="mb-2">No payload suggestions yet</p>
            <p className="text-sm">
              Start a chat analysis to generate payload suggestions.
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-600">
        <div className="text-xs text-gray-400">
          <strong className="text-gray-300">💡 How to use:</strong>
          <br />• Click payloads to select and view details
          <br />• Drag payloads to the request editor
          <br />• Use chat to get specific recommendations
        </div>
      </div>
    </div>
  );
};

export default PayloadSuggestionPanel;