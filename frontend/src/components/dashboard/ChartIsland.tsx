import React from 'react';
import { Island } from '../ui/Island.js';

export interface ChartIslandProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

const ChartIsland: React.FC<ChartIslandProps> = ({ 
  title, 
  children, 
  className = '', 
  actions,
  isLoading = false 
}) => {
  return (
    <Island
      variant="primary"
      elevation="medium"
      size="lg"
      appear
      className={`chart-island ${className}`}
    >
      <div className="h-full flex flex-col">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>

        {/* Chart Content */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </Island>
  );
};

export default ChartIsland;