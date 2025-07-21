import React from 'react';
import { Island } from './Island';
import { IslandContainer } from './IslandContainer';

export const IslandDemo: React.FC = () => {
  return (
    <IslandContainer 
      gradient={true}
      centered={true}
      maxWidth="1200px"
      padding={{
        mobile: '1rem',
        tablet: '1.5rem',
        desktop: '2rem'
      }}
    >
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Island System Demo
      </h1>

      {/* Container Layout Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Grid Layout Container
        </h2>
        <IslandContainer 
          layout="grid" 
          spacing="normal"
          gradient={false}
          grid={{
            columns: {
              mobile: 1,
              tablet: 2,
              desktop: 4
            }
          }}
        >
          <Island variant="primary">
            <h3 className="font-semibold mb-2">Primary Island</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Default variant with standard styling
            </p>
          </Island>
          
          <Island variant="secondary">
            <h3 className="font-semibold mb-2">Secondary Island</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Subtle background variant
            </p>
          </Island>
          
          <Island variant="accent">
            <h3 className="font-semibold mb-2">Accent Island</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Highlighted with accent colors
            </p>
          </Island>
          
          <Island variant="danger">
            <h3 className="font-semibold mb-2">Danger Island</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Warning or error states
            </p>
          </Island>
        </IslandContainer>
      </section>

      {/* Flex Layout Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Flex Layout Container
        </h2>
        <IslandContainer 
          layout="flex" 
          spacing="loose"
          gradient={false}
        >
          <Island elevation="none">
            <h3 className="font-semibold mb-2">No Elevation</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Flat design without shadows
            </p>
          </Island>
          
          <Island elevation="low">
            <h3 className="font-semibold mb-2">Low Elevation</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Subtle shadow depth
            </p>
          </Island>
          
          <Island elevation="medium">
            <h3 className="font-semibold mb-2">Medium Elevation</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Standard shadow depth (default)
            </p>
          </Island>
          
          <Island elevation="high">
            <h3 className="font-semibold mb-2">High Elevation</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Prominent shadow depth
            </p>
          </Island>
        </IslandContainer>
      </section>

      {/* Spacing Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Container Spacing Options
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Tight Spacing
            </h3>
            <IslandContainer layout="grid" spacing="tight" gradient={false} grid={{ columns: { desktop: 4 } }}>
              <Island size="sm">
                <h4 className="font-semibold mb-2">Small</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Compact padding
                </p>
              </Island>
              <Island size="md">
                <h4 className="font-semibold mb-2">Medium</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Standard padding
                </p>
              </Island>
              <Island size="lg">
                <h4 className="font-semibold mb-2">Large</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Generous padding
                </p>
              </Island>
              <Island size="xl">
                <h4 className="font-semibold mb-2">Extra Large</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Maximum padding
                </p>
              </Island>
            </IslandContainer>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Loose Spacing
            </h3>
            <IslandContainer layout="grid" spacing="loose" gradient={false} grid={{ columns: { desktop: 2 } }}>
              <Island 
                interactive 
                onClick={() => alert('Primary island clicked!')}
                variant="primary"
              >
                <h4 className="font-semibold mb-2">Clickable Island</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Click me to see interaction
                </p>
              </Island>
              
              <Island 
                interactive 
                onClick={() => alert('Accent island clicked!')}
                variant="accent"
                elevation="high"
              >
                <h4 className="font-semibold mb-2">Interactive Accent</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  High elevation with accent styling
                </p>
              </Island>
            </IslandContainer>
          </div>
        </div>
      </section>

      {/* Masonry Layout Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Masonry Layout Container
        </h2>
        <IslandContainer layout="masonry" spacing="normal" gradient={false}>
          <Island variant="primary" size="sm">
            <h3 className="font-semibold mb-2">Short Content</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This island has minimal content.
            </p>
          </Island>
          
          <Island variant="secondary" size="md">
            <h3 className="font-semibold mb-2">Medium Content</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This island has a bit more content to demonstrate how the masonry layout handles different heights.
            </p>
          </Island>
          
          <Island variant="accent" size="lg">
            <h3 className="font-semibold mb-2">Longer Content</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This island contains significantly more content to show how the masonry layout system automatically arranges islands of different heights in an optimal way, creating a Pinterest-like layout.
            </p>
            <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <li>• Feature one</li>
              <li>• Feature two</li>
              <li>• Feature three</li>
            </ul>
          </Island>
          
          <Island variant="primary" size="sm">
            <h3 className="font-semibold mb-2">Another Short</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Compact content again.
            </p>
          </Island>
        </IslandContainer>
      </section>

      {/* Responsive Container Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Responsive Container System
        </h2>
        <IslandContainer 
          layout="grid"
          spacing="normal"
          gradient={false}
          grid={{
            columns: {
              mobile: 1,
              tablet: 2,
              desktop: 3
            }
          }}
          padding={{
            mobile: '0.5rem',
            tablet: '1rem',
            desktop: '1.5rem'
          }}
        >
          <Island 
            responsive={{
              mobile: { size: 'sm' },
              tablet: { size: 'md' },
              desktop: { size: 'lg' }
            }}
            variant="accent"
          >
            <h3 className="font-semibold mb-2">Responsive Island</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Both the container and this island adapt to screen size:
            </p>
            <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <li>• Mobile: 1 column, small padding</li>
              <li>• Tablet: 2 columns, medium padding</li>
              <li>• Desktop: 3 columns, large padding</li>
            </ul>
          </Island>

          <Island appear variant="primary" elevation="medium">
            <h3 className="font-semibold mb-2">Animated Island</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This island appears with smooth animation
            </p>
          </Island>

          <Island variant="secondary" elevation="low">
            <h3 className="font-semibold mb-2">Adaptive Layout</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              The container automatically adjusts the grid based on screen size
            </p>
          </Island>
        </IslandContainer>
      </section>

      {/* Custom Gradient Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Custom Background Container
        </h2>
        <IslandContainer 
          layout="flex"
          spacing="loose"
          customGradient="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
          centered={false}
          maxWidth="100%"
        >
          <Island variant="primary" elevation="high">
            <h3 className="font-semibold mb-2">Custom Background</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This container uses a custom gradient background
            </p>
          </Island>
          
          <Island variant="accent" elevation="medium">
            <h3 className="font-semibold mb-2">Flexible Layout</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Islands flow naturally in flex layout
            </p>
          </Island>
        </IslandContainer>
      </section>
    </IslandContainer>
  );
};