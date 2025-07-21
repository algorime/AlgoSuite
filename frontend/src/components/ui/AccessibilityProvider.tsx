import React, { createContext, useContext, ReactNode } from 'react';
import { useAriaLiveRegion } from '../../hooks/useAccessibility.js';

interface AccessibilityContextType {
  announce: (message: string) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
  clearAnnouncements: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const politeRegion = useAriaLiveRegion('polite');
  const assertiveRegion = useAriaLiveRegion('assertive');

  const contextValue: AccessibilityContextType = {
    announce: politeRegion.announce,
    announcePolite: politeRegion.announce,
    announceAssertive: assertiveRegion.announce,
    clearAnnouncements: () => {
      politeRegion.clearAnnouncements();
      assertiveRegion.clearAnnouncements();
    },
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* ARIA Live Regions for Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {politeRegion.announcements.map((announcement, index) => (
          <div key={`polite-${index}`}>{announcement}</div>
        ))}
      </div>
      
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {assertiveRegion.announcements.map((announcement, index) => (
          <div key={`assertive-${index}`}>{announcement}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityAnnouncements = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityAnnouncements must be used within an AccessibilityProvider');
  }
  return context;
};

// Skip Links Component for Keyboard Navigation
interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
  return (
    <nav aria-label="Skip navigation links" className="skip-links-container">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              (target as HTMLElement).focus();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

// Focus Trap Component
interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active = true, 
  restoreFocus = true,
  className = '' 
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when component unmounts
      if (restoreFocus && previousFocusRef.current) {
        try {
          previousFocusRef.current.focus();
        } catch (error) {
          // Element might no longer exist
        }
      }
    };
  }, [active, restoreFocus]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-focus-trap={active}
    >
      {children}
    </div>
  );
};

// Landmark Component for better semantic structure
interface LandmarkProps {
  children: ReactNode;
  role: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'region';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
}

export const Landmark: React.FC<LandmarkProps> = ({
  children,
  role,
  ariaLabel,
  ariaLabelledBy,
  className = ''
}) => {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={className}
    >
      {children}
    </div>
  );
};

// Screen Reader Only Component
interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  as: Component = 'span' 
}) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};