import React, { useState } from 'react';
import MetricIsland from './MetricIsland.js';
import ChartIsland from './ChartIsland.js';
import FilterIsland from './FilterIsland.js';
import RecentFindingsIsland from './RecentFindingsIsland.js';
import type { MetricData } from './MetricIsland.js';
import type { Finding } from './RecentFindingsIsland.js';
import VulnerabilityTrendsChart from './VulnerabilityTrendsChart.js';
import './DashboardIsland.css';

export interface DashboardIslandProps {
  className?: string;
}

const DashboardIsland: React.FC<DashboardIslandProps> = ({ className = '' }) => {
  const [filters, setFilters] = useState<{
    timeRange: string;
    severity: string;
    type: string;
  }>({
    timeRange: '24h',
    severity: 'all',
    type: 'all'
  });

  // Mock data - in a real app this would come from API calls
  const metrics: MetricData[] = [
    { 
      title: 'Vulnerabilities Found', 
      value: '12', 
      change: '+3 from last scan',
      trend: 'up'
    },
    { 
      title: 'SQL Injection Points', 
      value: '8', 
      change: '+2 from last scan',
      trend: 'up'
    },
    { 
      title: 'Success Rate', 
      value: '67%', 
      change: '+5% improvement',
      trend: 'up'
    },
    { 
      title: 'Payloads Tested', 
      value: '156', 
      change: '+24 this session',
      trend: 'up'
    },
  ];

  const recentFindings: Finding[] = [
    { id: 1, type: 'SQL Injection', severity: 'High', endpoint: '/api/users', time: '2 min ago' },
    { id: 2, type: 'XSS', severity: 'Medium', endpoint: '/search', time: '5 min ago' },
    { id: 3, type: 'SQL Injection', severity: 'Critical', endpoint: '/admin/login', time: '8 min ago' },
    { id: 4, type: 'CSRF', severity: 'Low', endpoint: '/profile/update', time: '12 min ago' },
  ];

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    // In a real app, this would trigger data refetch with new filters
    console.log('Filters changed:', newFilters);
  };

  const chartActions = (
    <div className="flex items-center space-x-2">
      <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
        Export
      </button>
      <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
        Refresh
      </button>
    </div>
  );

  return (
    <div className={`dashboard-island-container ${className}`}>
      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Filter Panel - Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <FilterIsland onFiltersChange={handleFiltersChange} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <MetricIsland 
                key={index} 
                metric={metric}
                className="min-h-[120px]"
              />
            ))}
          </div>

          {/* Charts and Findings Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Vulnerability Trends Chart */}
            <ChartIsland 
              title="Vulnerability Trends"
              actions={chartActions}
              className="min-h-[400px]"
            >
              <VulnerabilityTrendsChart />
            </ChartIsland>

            {/* Recent Findings */}
            <RecentFindingsIsland 
              findings={recentFindings}
              className="min-h-[400px]"
            />
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Severity Distribution Chart */}
            <ChartIsland 
              title="Severity Distribution"
              actions={chartActions}
              className="min-h-[300px]"
            >
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  {/* Mock pie chart */}
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-green-500"></div>
                    <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Critical: 15%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>High: 25%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Medium: 35%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Low: 25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </ChartIsland>

            {/* Attack Vector Analysis */}
            <ChartIsland 
              title="Attack Vector Analysis"
              actions={chartActions}
              className="min-h-[300px]"
            >
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  {/* Mock horizontal bar chart */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-20 text-left">SQL Injection</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">75%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-20 text-left">XSS</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">45%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-20 text-left">CSRF</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">30%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-20 text-left">Other</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </ChartIsland>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIsland;