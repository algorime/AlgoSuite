import React from 'react';
import DashboardIsland from './DashboardIsland.js';
import './DashboardIsland.css';

interface DashboardIslandWrapperProps {
  className?: string;
  isLoading?: boolean;
}

const DashboardIslandWrapper: React.FC<DashboardIslandWrapperProps> = ({ 
  className = '',
  isLoading = false 
}) => {
  return (
    <div className={`dashboard-wrapper ${className}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <DashboardIsland />
      )}
    </div>
  );
};

export default DashboardIslandWrapper;