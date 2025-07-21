import React from 'react';
import { ContentIsland } from '../ui/ContentIsland.js';
import StudioIsland from './StudioIsland.js';

interface StudioIslandWrapperProps {
  className?: string;
  isLoading?: boolean;
}

const StudioIslandWrapper: React.FC<StudioIslandWrapperProps> = ({ 
  className = '',
  isLoading = false 
}) => {
  return (
    <ContentIsland
      contentType="studio"
      fillHeight={true}
      isLoading={isLoading}
      className={`${className} studio-island-wrapper`}
      elevation="high"
      size="xl"
      showTransitions={true}
    >
      <StudioIsland className="h-full" />
    </ContentIsland>
  );
};

export default StudioIslandWrapper;