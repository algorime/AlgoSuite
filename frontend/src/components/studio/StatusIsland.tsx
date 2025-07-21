import React from 'react';
import { Island } from '../ui/Island.js';
import type { PayloadSuggestion, PayloadAnalysisResult, PayloadApplicatorResult } from '../../types';
import Button from '../ui/Button';

interface StatusIslandProps {
  payloadSuggestions: PayloadSuggestion[];
  analysisResult: PayloadAnalysisResult | null;
  appliedPayloads: string[];
  applicationResult: PayloadApplicatorResult | null;
  savedPayloads: PayloadSuggestion[];
  onOpenSavedPayloads: () => void;
  className?: string;
}

const StatusIsland: React.FC<StatusIslandProps> = ({
  payloadSuggestions,
  analysisResult,
  appliedPayloads,
  applicationResult,
  savedPayloads,
  onOpenSavedPayloads,
  className = ''
}) => {
  return (
    <Island
      variant="secondary"
      elevation="low"
      size="sm"
      className={`fixed bottom-4 left-4 right-4 z-40 ${className}`}
    >
      <div className="flex items-center justify-between text-sm">
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
          <Button size="sm" variant="outline" onClick={onOpenSavedPayloads}>
            Saved Payloads ({savedPayloads.length})
          </Button>
          <span className="text-xs opacity-70">
            {applicationResult ? `Last applied: ${applicationResult.applied_payload.payload.type}` : 'No payload applied'}
          </span>
        </div>
      </div>
    </Island>
  );
};

export default StatusIsland;