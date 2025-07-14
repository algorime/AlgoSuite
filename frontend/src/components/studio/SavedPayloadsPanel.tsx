import React, { useState } from 'react';
import type { PayloadSuggestion } from '../../types';
import Button from '../ui/Button';

interface SavedPayloadsPanelProps {
  savedPayloads: PayloadSuggestion[];
  onUnsave: (payload: PayloadSuggestion) => void;
  onCopy: (payload: string) => void;
  onClose: () => void;
  className?: string;
}

const SavedPayloadsPanel: React.FC<SavedPayloadsPanelProps> = ({
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
    <div className={`fixed top-0 right-0 h-full bg-gray-800 shadow-lg z-50 p-4 transition-transform transform ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Saved Payloads</h3>
        <Button size="sm" variant="secondary" onClick={onClose} className="text-white">
          &times;
        </Button>
      </div>
      <div className="space-y-2">
        {savedPayloads.length === 0 ? (
          <p className="text-gray-400">No payloads saved yet.</p>
        ) : (
          savedPayloads.map((payload, index) => (
            <div key={index} className="bg-gray-700 p-2 rounded">
              <div className="flex justify-between items-center">
                <p className="text-sm text-white font-mono">{payload.payload}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(payload.payload)}
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
                  <Button size="sm" variant="danger" onClick={() => onUnsave(payload)}>
                    Unsave
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedPayloadsPanel;