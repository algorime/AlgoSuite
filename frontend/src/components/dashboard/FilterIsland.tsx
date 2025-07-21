import React, { useState } from 'react';
import { Island } from '../ui/Island.js';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterIslandProps {
  className?: string;
  onFiltersChange?: (filters: Record<string, string>) => void;
}

const FilterIsland: React.FC<FilterIslandProps> = ({ 
  className = '', 
  onFiltersChange 
}) => {
  const [filters, setFilters] = useState({
    timeRange: '24h',
    severity: 'all',
    type: 'all'
  });

  const timeRangeOptions: FilterOption[] = [
    { id: '1h', label: 'Last Hour', value: '1h' },
    { id: '24h', label: 'Last 24 Hours', value: '24h' },
    { id: '7d', label: 'Last 7 Days', value: '7d' },
    { id: '30d', label: 'Last 30 Days', value: '30d' },
  ];

  const severityOptions: FilterOption[] = [
    { id: 'all', label: 'All Severities', value: 'all' },
    { id: 'critical', label: 'Critical', value: 'critical' },
    { id: 'high', label: 'High', value: 'high' },
    { id: 'medium', label: 'Medium', value: 'medium' },
    { id: 'low', label: 'Low', value: 'low' },
  ];

  const typeOptions: FilterOption[] = [
    { id: 'all', label: 'All Types', value: 'all' },
    { id: 'sqli', label: 'SQL Injection', value: 'sqli' },
    { id: 'xss', label: 'XSS', value: 'xss' },
    { id: 'csrf', label: 'CSRF', value: 'csrf' },
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = { timeRange: '24h', severity: 'all', type: 'all' };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  return (
    <Island
      variant="secondary"
      elevation="low"
      size="md"
      appear
      className={`filter-island ${className}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Severity
          </label>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            {severityOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vulnerability Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            {typeOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Island>
  );
};

export default FilterIsland;