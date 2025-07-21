import React from 'react';
import { Island } from './Island.js';
import { IslandContainer } from './IslandContainer.js';

const ResponsiveDemo: React.FC = () => {
  return (
    <IslandContainer
      layout="grid"
      grid={{
        columns: {
          mobile: 1,
          tablet: 2,
          desktop: 3,
        },
        gap: {
          mobile: '0.5rem',
          tablet: '1rem',
          desktop: '1.5rem',
        },
      }}
      padding={{
        mobile: '1rem',
        tablet: '1.5rem',
        desktop: '2rem',
      }}
    >
      {/* Basic responsive island */}
      <Island
        variant="primary"
        elevation="medium"
        responsive={{
          mobile: { size: 'sm', layout: 'compact' },
          tablet: { size: 'md', layout: 'default' },
          desktop: { size: 'lg', layout: 'spacious' },
        }}
      >
        <h3>Responsive Island</h3>
        <p>This island adapts its size and layout based on screen size.</p>
      </Island>

      {/* Touch-optimized island */}
      <Island
        variant="secondary"
        interactive
        touchOptimized
        responsive={{
          mobile: { size: 'md', padding: '1rem' },
          tablet: { size: 'lg', padding: '1.5rem' },
        }}
      >
        <h3>Touch Optimized</h3>
        <p>This island provides touch feedback on mobile devices.</p>
      </Island>

      {/* Container query island */}
      <Island
        variant="accent"
        enableContainerQueries
        responsive={{
          mobile: { layout: 'minimal' },
          desktop: { layout: 'spacious' },
        }}
      >
        <h3>Container Queries</h3>
        <p>This island uses modern container queries for responsive design.</p>
      </Island>

      {/* Hidden on mobile */}
      <Island
        variant="primary"
        responsive={{
          mobile: { hidden: true },
          tablet: { size: 'md' },
          desktop: { size: 'lg' },
        }}
      >
        <h3>Desktop Only</h3>
        <p>This island is hidden on mobile devices.</p>
      </Island>

      {/* Different elevations per breakpoint */}
      <Island
        variant="secondary"
        responsive={{
          mobile: { elevation: 'low', size: 'sm' },
          tablet: { elevation: 'medium', size: 'md' },
          desktop: { elevation: 'high', size: 'lg' },
        }}
      >
        <h3>Responsive Elevation</h3>
        <p>This island has different shadow elevations at different screen sizes.</p>
      </Island>

      {/* Appearance animation */}
      <Island
        variant="accent"
        appear
        responsive={{
          mobile: { layout: 'compact' },
          desktop: { layout: 'default' },
        }}
      >
        <h3>Animated Appearance</h3>
        <p>This island appears with animation and adapts its layout.</p>
      </Island>
    </IslandContainer>
  );
};

export default ResponsiveDemo;