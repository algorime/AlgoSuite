import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Island } from '../ui/Island.js';
import Button from '../ui/Button.js';

const StudioPage: React.FC = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'var(--color-bg-gradient)',
        transition: 'background var(--transition-duration-normal) var(--transition-easing)'
      }}
    >
      {/* Main Content */}
      <main 
        className="container mx-auto pt-20 pb-6 px-4"
        role="main"
        aria-label="Studio page content"
      >
        <div className="flex items-center justify-center h-full">
          <Button
            variant="primary"
            size="lg"
            elevation="medium"
            onClick={handleHomeClick}
            aria-label="Navigate to homepage"
          >
            Go Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StudioPage;