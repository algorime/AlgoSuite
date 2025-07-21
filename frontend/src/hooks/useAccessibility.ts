import { useEffect, useCallback, useRef, useState } from 'react';
import { useResponsive } from './useResponsive.js';

export interface AccessibilityOptions {
  /** Whether to announce changes to screen readers */
  announceChanges?: boolean;
  /** Whether to manage focus trapping */
  trapFocus?: boolean;
  /** Whether to restore focus when component unmounts */
  restoreFocus?: boolean;
  /** Whether to provide keyboard navigation */
  keyboardNavigation?: boolean;
  /** Custom ARIA live region politeness */
  liveRegionPoliteness?: 'polite' | 'assertive' | 'off';
}

export interface AccessibilityState {
  /** Whether the element is currently focused */
  isFocused: boolean;
  /** Whether the element is currently pressed */
  isPressed: boolean;
  /** Current announcement text for screen readers */
  announceText: string;
  /** Whether high contrast mode is active */
  isHighContrast: boolean;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
}

export interface AccessibilityActions {
  /** Announce text to screen readers */
  announce: (text: string) => void;
  /** Set focus state */
  setFocused: (focused: boolean) => void;
  /** Set pressed state */
  setPressed: (pressed: boolean) => void;
  /** Get focusable elements within a container */
  getFocusableElements: (container: HTMLElement) => HTMLElement[];
  /** Trap focus within a container */
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => boolean;
  /** Restore focus to previously focused element */
  restoreFocus: () => void;
}

/**
 * Hook for managing accessibility features
 * Provides utilities for screen reader announcements, focus management, and keyboard navigation
 */
export const useAccessibility = (options: AccessibilityOptions = {}): [AccessibilityState, AccessibilityActions] => {
  const {
    announceChanges = false,
    trapFocus = false,
    restoreFocus = false,
    keyboardNavigation = true,
    liveRegionPoliteness = 'polite'
  } = options;

  const responsiveState = useResponsive();
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  
  // Store reference to previously focused element for restoration
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Store focusable elements for focus trapping
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Get focusable elements within a container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled]):not([aria-hidden="true"])',
      'input:not([disabled]):not([aria-hidden="true"])',
      'select:not([disabled]):not([aria-hidden="true"])',
      'textarea:not([disabled]):not([aria-hidden="true"])',
      'a[href]:not([aria-hidden="true"])',
      '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
      '[contenteditable="true"]:not([aria-hidden="true"])',
      'details summary:not([aria-hidden="true"])',
      'audio[controls]:not([aria-hidden="true"])',
      'video[controls]:not([aria-hidden="true"])'
    ].join(', ');
    
    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    // Filter out elements that are not visible or have display: none
    return elements.filter(element => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetParent !== null;
    });
  }, []);

  // Announce text to screen readers
  const announce = useCallback((text: string) => {
    if (!announceChanges || !text.trim()) return;
    
    setAnnounceText(text);
    
    // Clear the announcement after screen readers have had time to read it
    const timeout = text.length > 50 ? 3000 : 1500;
    setTimeout(() => setAnnounceText(''), timeout);
  }, [announceChanges]);

  // Set focused state and manage focus restoration
  const setFocused = useCallback((focused: boolean) => {
    setIsFocused(focused);
    
    if (focused && restoreFocus && !previousFocusRef.current) {
      // Store the previously focused element when we gain focus
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Set pressed state
  const setPressed = useCallback((pressed: boolean) => {
    setIsPressed(pressed);
  }, []);

  // Handle focus trapping within a container
  const handleFocusTrap = useCallback((container: HTMLElement, event: KeyboardEvent): boolean => {
    if (!trapFocus || event.key !== 'Tab') return false;
    
    const focusableElements = getFocusableElements(container);
    focusableElementsRef.current = focusableElements;
    
    if (focusableElements.length === 0) return false;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;
    
    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return true;
      }
    } else {
      // Tab (forward)
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return true;
      }
    }
    
    return false;
  }, [trapFocus, getFocusableElements]);

  // Restore focus to previously focused element
  const restoreFocusAction = useCallback(() => {
    if (restoreFocus && previousFocusRef.current) {
      try {
        previousFocusRef.current.focus();
      } catch (error) {
        // Element might no longer exist or be focusable
        console.warn('Could not restore focus:', error);
      }
      previousFocusRef.current = null;
    }
  }, [restoreFocus]);

  // Cleanup focus restoration on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        try {
          previousFocusRef.current.focus();
        } catch (error) {
          // Element might no longer exist
        }
      }
    };
  }, [restoreFocus]);

  // Create accessibility state
  const state: AccessibilityState = {
    isFocused,
    isPressed,
    announceText,
    isHighContrast: responsiveState.prefersHighContrast,
    prefersReducedMotion: responsiveState.prefersReducedMotion,
  };

  // Create accessibility actions
  const actions: AccessibilityActions = {
    announce,
    setFocused,
    setPressed,
    getFocusableElements,
    trapFocus: handleFocusTrap,
    restoreFocus: restoreFocusAction,
  };

  return [state, actions];
};

/**
 * Hook for managing keyboard navigation
 * Provides utilities for handling keyboard events and navigation
 */
export const useKeyboardNavigation = (options: {
  onEnter?: (event: KeyboardEvent) => void;
  onSpace?: (event: KeyboardEvent) => void;
  onEscape?: (event: KeyboardEvent) => void;
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right', event: KeyboardEvent) => void;
  trapFocus?: boolean;
  container?: React.RefObject<HTMLElement>;
} = {}) => {
  const { onEnter, onSpace, onEscape, onArrowKeys, trapFocus, container } = options;
  const [, accessibilityActions] = useAccessibility({ trapFocus });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      
      case ' ':
      case 'Space':
        if (onSpace) {
          event.preventDefault();
          onSpace(event);
        }
        break;
      
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      
      case 'ArrowUp':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('up', event);
        }
        break;
      
      case 'ArrowDown':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('down', event);
        }
        break;
      
      case 'ArrowLeft':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('left', event);
        }
        break;
      
      case 'ArrowRight':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('right', event);
        }
        break;
      
      case 'Tab':
        if (trapFocus && container?.current) {
          const trapped = accessibilityActions.trapFocus(container.current, event);
          if (trapped) {
            return; // Event was handled by focus trap
          }
        }
        break;
    }
  }, [onEnter, onSpace, onEscape, onArrowKeys, trapFocus, container, accessibilityActions]);

  return { handleKeyDown };
};

/**
 * Hook for managing ARIA live regions
 * Provides utilities for screen reader announcements
 */
export const useAriaLiveRegion = (politeness: 'polite' | 'assertive' = 'polite') => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((message: string) => {
    if (!message.trim()) return;

    setAnnouncements(prev => [...prev, message]);

    // Clear announcements after they've been read
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAnnouncements([]);
    }, 1000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    announcements,
    announce,
    clearAnnouncements,
    politeness,
  };
};