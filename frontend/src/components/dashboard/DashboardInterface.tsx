import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface DashboardInterfaceProps {
  className?: string;
}

const DashboardInterface: React.FC<DashboardInterfaceProps> = ({ className = '' }) => {
  // Mock data for demonstration
  const metrics = [
    { title: 'Vulnerabilities Found', value: '12', change: '+3 from last scan' },
    { title: 'SQL Injection Points', value: '8', change: '+2 from last scan' },
    { title: 'Success Rate', value: '67%', change: '+5% improvement' },
    { title: 'Payloads Tested', value: '156', change: '+24 this session' },
  ];

  const recentFindings = [
    { id: 1, type: 'SQL Injection', severity: 'High', endpoint: '/api/users', time: '2 min ago' },
    { id: 2, type: 'XSS', severity: 'Medium', endpoint: '/search', time: '5 min ago' },
    { id: 3, type: 'SQL Injection', severity: 'Critical', endpoint: '/admin/login', time: '8 min ago' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {metric.change}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vulnerability Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFindings.map((finding) => (
              <div key={finding.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {finding.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {finding.endpoint}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {finding.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Vulnerability Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Chart visualization coming soon</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Vulnerability trends and analytics will be displayed here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInterface;