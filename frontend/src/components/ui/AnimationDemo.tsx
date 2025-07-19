import React, { useState } from 'react';
import { AnimatedIsland } from './AnimatedIsland.js';
import { useAnimation } from '../../hooks/useAnimation.js';
import type { ElevationLevel } from '../../types/animation.js';

const AnimationDemo: React.FC = () => {
  const [showIslands, setShowIslands] = useState(true);
  const [currentElevation, setCurrentElevation] = useState<ElevationLevel>('medium');
  const { reducedMotion } = useAnimation();

  const toggleIslands = () => {
    setShowIslands(!showIslands);
  };

  const elevationLevels: ElevationLevel[] = ['none', 'low', 'medium', 'high'];

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Animation System Demo
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {reducedMotion ? 'Reduced motion is enabled' : 'Full animations are enabled'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={toggleIslands}
          className="button-island px-4 py-2 rounded"
          style={{
            backgroundColor: 'var(--color-interactive-primary)',
            color: 'white',
            borderRadius: 'var(--border-radius-button)',
          }}
        >
          {showIslands ? 'Hide Islands' : 'Show Islands'}
        </button>

        <select
          value={currentElevation}
          onChange={(e) => setCurrentElevation(e.target.value as ElevationLevel)}
          className="px-3 py-2 rounded border interactive-hover"
          style={{
            backgroundColor: 'var(--color-island-bg)',
            borderColor: 'var(--color-island-border)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--border-radius-button)',
          }}
        >
          {elevationLevels.map(level => (
            <option key={level} value={level}>
              Elevation: {level}
            </option>
          ))}
        </select>
      </div>

      {/* Island Grid */}
      {showIslands && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Primary Island */}
          <AnimatedIsland
            elevation={currentElevation}
            variant="primary"
            appear={true}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Primary Island
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This is a primary island with {currentElevation} elevation. Hover to see the elevation change.
            </p>
          </AnimatedIsland>

          {/* Secondary Island */}
          <AnimatedIsland
            elevation={currentElevation}
            variant="secondary"
            appear={true}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Secondary Island
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Secondary variant with smooth hover transitions and theme-aware colors.
            </p>
          </AnimatedIsland>

          {/* Accent Island */}
          <AnimatedIsland
            elevation={currentElevation}
            variant="accent"
            appear={true}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Accent Island
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Accent variant with blue tinting that adapts to light and dark themes.
            </p>
          </AnimatedIsland>

          {/* Interactive Island */}
          <AnimatedIsland
            elevation={currentElevation}
            variant="primary"
            appear={true}
            onClick={() => alert('Island clicked!')}
            className="cursor-pointer"
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Interactive Island
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Click me! This island has click interactions with proper hover states.
            </p>
          </AnimatedIsland>
        </div>
      )}

      {/* Animation Features List */}
      <AnimatedIsland elevation="low" variant="secondary">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Animation Features Implemented
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <li>✅ Smooth island appearance/disappearance animations</li>
          <li>✅ Elevation-based hover effects with transform and shadow changes</li>
          <li>✅ Theme switching animations with smooth color transitions</li>
          <li>✅ Reduced motion support for accessibility</li>
          <li>✅ Hardware-accelerated animations using transform3d</li>
          <li>✅ Configurable animation durations and easing functions</li>
          <li>✅ CSS custom properties for consistent theming</li>
          <li>✅ Interactive hover states with scale and elevation changes</li>
        </ul>
      </AnimatedIsland>
    </div>
  );
};

export default AnimationDemo;