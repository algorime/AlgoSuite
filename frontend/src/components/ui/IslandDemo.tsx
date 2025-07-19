import React from 'react';
import { Island } from './Island';

export const IslandDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8">
        Island Component Demo
      </h1>

      {/* Variants Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Island variant="primary">
            <h3 className="font-semibold mb-2">Primary Island</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Default variant with standard styling
            </p>
          </Island>
          
          <Island variant="secondary">
            <h3 className="font-semibold mb-2">Secondary Island</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Subtle background variant
            </p>
          </Island>
          
          <Island variant="accent">
            <h3 className="font-semibold mb-2">Accent Island</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Highlighted with accent colors
            </p>
          </Island>
          
          <Island variant="danger">
            <h3 className="font-semibold mb-2">Danger Island</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Warning or error states
            </p>
          </Island>
        </div>
      </section>

      {/* Elevation Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Elevation Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Island elevation="none">
            <h3 className="font-semibold mb-2">No Elevation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Flat design without shadows
            </p>
          </Island>
          
          <Island elevation="low">
            <h3 className="font-semibold mb-2">Low Elevation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Subtle shadow depth
            </p>
          </Island>
          
          <Island elevation="medium">
            <h3 className="font-semibold mb-2">Medium Elevation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Standard shadow depth (default)
            </p>
          </Island>
          
          <Island elevation="high">
            <h3 className="font-semibold mb-2">High Elevation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Prominent shadow depth
            </p>
          </Island>
        </div>
      </section>

      {/* Size Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Size Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Island size="sm">
            <h3 className="font-semibold mb-2">Small</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Compact padding
            </p>
          </Island>
          
          <Island size="md">
            <h3 className="font-semibold mb-2">Medium</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Standard padding (default)
            </p>
          </Island>
          
          <Island size="lg">
            <h3 className="font-semibold mb-2">Large</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generous padding
            </p>
          </Island>
          
          <Island size="xl">
            <h3 className="font-semibold mb-2">Extra Large</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Maximum padding
            </p>
          </Island>
        </div>
      </section>

      {/* Interactive Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Interactive Islands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Island 
            interactive 
            onClick={() => alert('Primary island clicked!')}
            variant="primary"
          >
            <h3 className="font-semibold mb-2">Clickable Island</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click me to see interaction
            </p>
          </Island>
          
          <Island 
            interactive 
            onClick={() => alert('Accent island clicked!')}
            variant="accent"
            elevation="high"
          >
            <h3 className="font-semibold mb-2">Interactive Accent</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              High elevation with accent styling
            </p>
          </Island>
        </div>
      </section>

      {/* Responsive Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Responsive Island
        </h2>
        <Island 
          responsive={{
            mobile: { size: 'sm' },
            tablet: { size: 'md' },
            desktop: { size: 'lg' }
          }}
          variant="accent"
        >
          <h3 className="font-semibold mb-2">Responsive Padding</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This island adapts its padding based on screen size:
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
            <li>• Mobile: Small padding</li>
            <li>• Tablet: Medium padding</li>
            <li>• Desktop: Large padding</li>
          </ul>
        </Island>
      </section>

      {/* Animation Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Animated Appearance
        </h2>
        <Island appear variant="primary" elevation="medium">
          <h3 className="font-semibold mb-2">Animated Island</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This island appears with a smooth animation
          </p>
        </Island>
      </section>
    </div>
  );
};