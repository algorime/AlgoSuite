import React from 'react';
import { Island } from '../ui/Island.js';

export interface MetricData {
  title: string;
  value: string;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export interface MetricIslandProps {
  metric: MetricData;
  className?: string;
}

const MetricIsland: React.FC<MetricIslandProps> = ({ metric, className = '' }) => {
  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Island
      variant="primary"
      elevation="low"
      size="md"
      appear
      className={`metric-island hover:elevation-medium transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {metric.title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {metric.value}
          </p>
          <div className="flex items-center space-x-1">
            <span className={`text-xs ${getTrendColor(metric.trend)}`}>
              {getTrendIcon(metric.trend)}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {metric.change}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          {metric.icon || (
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-purple-600 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </Island>
  );
};

export default MetricIsland;