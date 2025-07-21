import React, { useState } from 'react';
import Button from './Button';

const ButtonDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-[var(--color-bg-primary)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">
          Islands UI Button Component Demo
        </h1>

        {/* Variants Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </section>

        {/* Sizes Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Button Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Elevation Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Button Elevation (Hover to see effects)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button elevation="none">No Elevation</Button>
            <Button elevation="low">Low Elevation</Button>
            <Button elevation="medium">Medium Elevation</Button>
            <Button elevation="high">High Elevation</Button>
          </div>
        </section>

        {/* States Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Button States
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button isLoading={isLoading} onClick={handleLoadingDemo}>
              {isLoading ? 'Loading...' : 'Click for Loading Demo'}
            </Button>
          </div>
        </section>

        {/* Elevation + Variant Combinations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Floating Button Effects (Elevation + Variants)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">Primary Floating</h3>
              <div className="space-y-2">
                <Button variant="primary" elevation="low" className="w-full">Low Float</Button>
                <Button variant="primary" elevation="medium" className="w-full">Medium Float</Button>
                <Button variant="primary" elevation="high" className="w-full">High Float</Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">Secondary Floating</h3>
              <div className="space-y-2">
                <Button variant="secondary" elevation="low" className="w-full">Low Float</Button>
                <Button variant="secondary" elevation="medium" className="w-full">Medium Float</Button>
                <Button variant="secondary" elevation="high" className="w-full">High Float</Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">Accent Floating</h3>
              <div className="space-y-2">
                <Button variant="accent" elevation="low" className="w-full">Low Float</Button>
                <Button variant="accent" elevation="medium" className="w-full">Medium Float</Button>
                <Button variant="accent" elevation="high" className="w-full">High Float</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Island Style Toggle */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Island Style Comparison
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button islandStyle={true} elevation="medium">With Island Style</Button>
            <Button islandStyle={false} elevation="medium">Without Island Style</Button>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Interactive Demo
          </h2>
          <div className="bg-[var(--color-island-bg)] border border-[var(--color-island-border)] rounded-[var(--border-radius-island)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-[var(--color-text-secondary)] mb-4">
              Try hovering, clicking, and focusing on these buttons to see the smooth animations and transitions:
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="primary" 
                elevation="medium"
                onClick={() => alert('Primary button clicked!')}
              >
                Click Me
              </Button>
              <Button 
                variant="secondary" 
                elevation="low"
                onClick={() => alert('Secondary button clicked!')}
              >
                Or Me
              </Button>
              <Button 
                variant="accent" 
                elevation="high"
                onClick={() => alert('Accent button clicked!')}
              >
                Or Even Me
              </Button>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
            Common Usage Examples
          </h2>
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-[var(--color-island-bg)] border border-[var(--color-island-border)] rounded-[var(--border-radius-island)] p-4 shadow-[var(--shadow-low)]">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-3">Action Bar</h3>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="secondary" size="sm">Save Draft</Button>
                <Button variant="primary" size="sm" elevation="low">Publish</Button>
              </div>
            </div>

            {/* Floating Action Button */}
            <div className="bg-[var(--color-island-bg)] border border-[var(--color-island-border)] rounded-[var(--border-radius-island)] p-4 shadow-[var(--shadow-low)]">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-3">Floating Action Button</h3>
              <div className="flex justify-center">
                <Button 
                  variant="primary" 
                  elevation="high" 
                  size="lg"
                  className="rounded-full w-16 h-16 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Button Group */}
            <div className="bg-[var(--color-island-bg)] border border-[var(--color-island-border)] rounded-[var(--border-radius-island)] p-4 shadow-[var(--shadow-low)]">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-3">Button Group</h3>
              <div className="flex gap-0 rounded-[var(--border-radius-button)] overflow-hidden border border-[var(--color-island-border)]">
                <Button variant="secondary" className="rounded-none border-0 border-r border-[var(--color-island-border)]">
                  Left
                </Button>
                <Button variant="secondary" className="rounded-none border-0 border-r border-[var(--color-island-border)]">
                  Center
                </Button>
                <Button variant="secondary" className="rounded-none border-0">
                  Right
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonDemo;