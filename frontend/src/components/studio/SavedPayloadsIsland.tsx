import React, { useState } from 'react';
import { Island } from '../ui/Island.js';
import type { PayloadSuggestion } from '../../types';
import Button from '../ui/Button';

interface SavedPayloadsIslandProps {
  savedPayloads: PayloadSuggestion[];
  onUnsave: (payload: PayloadSuggestion) => void;
  onCopy: (payload: string) => void;
  onClose: () => void;
  className?: string;
}

const SavedPayloadsIsland: React.FC<SavedPayloadsIslandProps> = ({
  savedPayloads,
  onUnsave,
  onCopy,
  onClose,
  className = ''
}) => {
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);

  const handleCopy = (payload: string) => {
    onCopy(payload);
    setCopiedPayload(payload);
    setTimeout(() => setCopiedPayload(null), 2000);
  };

  return (
    <Island
      variant="accent"
      elevation="high"
      size="md"
      className={`fixed top-20 right-4 w-80 max-h-[80vh] z-50 transition-transform transform ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Saved Payloads</h3>
        <Button size="sm" variant="secondary" onClick={onClose}>
          &times;
        </Button>
      </div>
      
      <div className="space-y-2 overflow-y-auto max-h-[60vh]">
        {savedPayloads.length === 0 ? (
          <p className="opacity-80 text-center py-8">No payloads saved yet.</p>
        ) : (
          savedPayloads.map((payload, index) => (
            <Island
              key={index}
              variant="secondary"
              elevation="low"
              size="sm"
              className="hover:elevation-medium transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-mono flex-1 break-all">{payload.payload}</p>
                <div className="flex space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(payload.payload)}
                    className="p-1 opacity-70 hover:opacity-100 transition-opacity"
                    title="Copy payload"
                  >
                    {copiedPayload === payload.payload ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <Button size="sm" variant="danger" onClick={() => onUnsave(payload)}>
                    ×
                  </Button>
                </div>
              </div>
              
              {payload.description && (
                <div className="text-xs opacity-70 mt-2">
                  {payload.description}
                </div>
              )}
              
              {payload.type && (
                <div className="text-xs mt-1">
                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                    {payload.type.replace('_', ' ')}
                  </span>
                </div>
              )}
            </Island>
          ))
        )}
      </div>
    </Island>
  );
};

export default SavedPayloadsIsland;