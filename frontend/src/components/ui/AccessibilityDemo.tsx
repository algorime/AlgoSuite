import React, { useState } from 'react';
import { Island } from './Island.js';
import { AccessibilityProvider, SkipLinks, FocusTrap, Landmark, ScreenReaderOnly, useAccessibilityAnnouncements } from './AccessibilityProvider.js';

const AccessibilityDemoContent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const { announce, announceAssertive } = useAccessibilityAnnouncements();

  const handleInteraction = (type: string) => {
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    announce(`${type} interaction performed. Total interactions: ${newCount}`);
  };

  const handleImportantAction = () => {
    announceAssertive('Important action completed successfully!');
  };

  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#sidebar', label: 'Skip to sidebar' },
  ];

  return (
    <div className="accessibility-demo">
      <SkipLinks links={skipLinks} />
      
      <Landmark role="banner" ariaLabel="Site header">
        <Island
          variant="primary"
          elevation="medium"
          landmark
          landmarkRole="banner"
          ariaLabel="Application header"
          className="mb-4"
        >
          <h1>Accessibility Demo</h1>
          <ScreenReaderOnly>
            This page demonstrates comprehensive accessibility features for the Islands UI system.
          </ScreenReaderOnly>
        </Island>
      </Landmark>

      <Landmark role="navigation" ariaLabel="Main navigation">
        <Island
          id="navigation"
          variant="secondary"
          elevation="low"
          landmark
          landmarkRole="navigation"
          ariaLabel="Main navigation menu"
          className="mb-4"
        >
          <nav>
            <ul className="flex space-x-4" role="menubar">
              <li role="none">
                <Island
                  interactive
                  size="sm"
                  ariaLabel="Home page"
                  onClick={() => handleInteraction('Navigation')}
                  className="inline-block"
                >
                  Home
                </Island>
              </li>
              <li role="none">
                <Island
                  interactive
                  size="sm"
                  ariaLabel="About page"
                  onClick={() => handleInteraction('Navigation')}
                  className="inline-block"
                >
                  About
                </Island>
              </li>
              <li role="none">
                <Island
                  interactive
                  size="sm"
                  ariaLabel="Contact page"
                  onClick={() => handleInteraction('Navigation')}
                  className="inline-block"
                >
                  Contact
                </Island>
              </li>
            </ul>
          </nav>
        </Island>
      </Landmark>

      <div className="flex gap-4">
        <Landmark role="main" ariaLabel="Main content">
          <Island
            id="main-content"
            variant="primary"
            elevation="medium"
            landmark
            landmarkRole="main"
            ariaLabel="Main content area"
            ariaDescription="Primary content area containing interactive examples and demonstrations"
            className="flex-1"
          >
            <h2>Interactive Islands</h2>
            <p>These islands demonstrate various accessibility features:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Island
                interactive
                variant="accent"
                ariaLabel="Primary action button"
                ariaDescription="Performs the main action and announces the result"
                onClick={() => handleInteraction('Primary Action')}
                announceChanges
                touchOptimized
              >
                <h3>Primary Action</h3>
                <p>Click or press Enter/Space to activate</p>
                <ScreenReaderOnly>
                  This button will announce when activated
                </ScreenReaderOnly>
              </Island>

              <Island
                interactive
                variant="secondary"
                ariaLabel="Secondary action button"
                onClick={() => handleInteraction('Secondary Action')}
                focusManagement={{ focusable: true }}
              >
                <h3>Secondary Action</h3>
                <p>Another interactive island</p>
              </Island>

              <Island
                variant="danger"
                ariaLabel="Important action button"
                interactive
                onClick={handleImportantAction}
                ariaDescription="This action will make an assertive announcement"
              >
                <h3>Important Action</h3>
                <p>Makes assertive announcements</p>
              </Island>

              <Island
                variant="primary"
                ariaLabel="Form example"
                ariaDescription="Example form with accessible inputs"
              >
                <h3>Form Example</h3>
                <form>
                  <div className="mb-2">
                    <label htmlFor="demo-input" className="block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="demo-input"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      aria-describedby="demo-input-help"
                    />
                    <div id="demo-input-help" className="text-sm text-gray-500">
                      Enter your full name
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      handleInteraction('Form Submit');
                    }}
                  >
                    Submit
                  </button>
                </form>
              </Island>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Open Modal (Focus Trap Demo)
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3>Interaction Counter</h3>
              <p>Total interactions: {interactionCount}</p>
              <ScreenReaderOnly>
                Interaction count is announced when actions are performed
              </ScreenReaderOnly>
            </div>
          </Island>
        </Landmark>

        <Landmark role="complementary" ariaLabel="Sidebar">
          <Island
            id="sidebar"
            variant="secondary"
            elevation="low"
            landmark
            landmarkRole="complementary"
            ariaLabel="Additional information sidebar"
            className="w-64"
          >
            <h2>Accessibility Features</h2>
            <ul className="space-y-2 text-sm">
              <li>✓ ARIA labels and descriptions</li>
              <li>✓ Keyboard navigation</li>
              <li>✓ Focus management</li>
              <li>✓ Screen reader announcements</li>
              <li>✓ High contrast support</li>
              <li>✓ Reduced motion support</li>
              <li>✓ Touch accessibility</li>
              <li>✓ Skip links</li>
              <li>✓ Landmark regions</li>
              <li>✓ Focus trapping</li>
            </ul>
          </Island>
        </Landmark>
      </div>

      {/* Modal with Focus Trap */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FocusTrap active restoreFocus>
            <Island
              variant="primary"
              elevation="high"
              ariaLabel="Modal dialog"
              ariaDescription="Example modal with focus trapping"
              role="dialog"
              aria-modal="true"
              className="max-w-md mx-4"
            >
              <h2>Modal Dialog</h2>
              <p>This modal demonstrates focus trapping. Tab navigation is contained within this modal.</p>
              
              <div className="mt-4 space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  First Button
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded">
                  Second Button
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Close Modal
                </button>
              </div>
              
              <ScreenReaderOnly>
                Press Tab to navigate between buttons. Focus is trapped within this modal.
              </ScreenReaderOnly>
            </Island>
          </FocusTrap>
        </div>
      )}
    </div>
  );
};

export const AccessibilityDemo: React.FC = () => {
  return (
    <AccessibilityProvider>
      <AccessibilityDemoContent />
    </AccessibilityProvider>
  );
};