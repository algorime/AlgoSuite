import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Island } from './Island.js';
import ThemeSwitcher from './ThemeSwitcher.js';
import { useAnimation } from '../../hooks/useAnimation.js';

export type NavigationTab = 'chat' | 'editor' | 'dashboard' | 'studio' | 'local-studio' | 'animations' | 'islands' | 'buttons';

export interface NavigationIslandProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const NavigationIsland: React.FC<NavigationIslandProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { createTransition, reducedMotion } = useAnimation();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: { key: NavigationTab; label: string }[] = [
    { key: 'chat', label: 'Chat' },
    { key: 'editor', label: 'Payload Editor' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'studio', label: 'Studio' },
    { key: 'local-studio', label: 'Local Studio' },
    { key: 'animations', label: 'Animations' },
    { key: 'islands', label: 'Islands' },
    { key: 'buttons', label: 'Buttons' },
  ];

  const handleTabClick = (tab: NavigationTab) => {
    if (tab === 'studio') {
      navigate('/studio');
    } else if (tab === 'local-studio') {
      onTabChange(tab);
      if (location.pathname !== '/') {
        navigate('/');
      }
    } else {
      onTabChange(tab);
    }
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if we're on the studio page route
  const isStudioPage = location.pathname === '/studio';
  
  const getIsActive = (tab: NavigationTab): boolean => {
    const isStudioPage = location.pathname === '/studio';
    if (tab === 'studio') {
      return isStudioPage;
    }
    if (tab === 'local-studio') {
      return location.pathname === '/';
    }
    return !isStudioPage && activeTab === tab;
  };

  const navButtonStyles = (isActive: boolean): React.CSSProperties => ({
    color: isActive 
      ? 'var(--color-text-accent)' 
      : 'var(--color-text-secondary)',
    transition: createTransition(['color', 'transform'], 'fast'),
    transform: isActive && !reducedMotion ? 'translateY(-1px)' : 'translateY(0)',
  });

  const mobileMenuStyles: React.CSSProperties = {
    transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
    opacity: isMobileMenuOpen ? 1 : 0,
    transition: createTransition(['transform', 'opacity'], 'normal'),
    visibility: isMobileMenuOpen ? 'visible' : 'hidden',
  };

  const hamburgerLineStyles = (index: number): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: 'var(--color-text-primary)',
      transition: createTransition(['transform', 'opacity'], 'fast'),
      transformOrigin: 'center',
    };

    if (!isMobileMenuOpen) return baseStyles;

    // Animate hamburger to X when open
    switch (index) {
      case 0:
        return { ...baseStyles, transform: 'rotate(45deg) translateY(6px)' };
      case 1:
        return { ...baseStyles, opacity: 0 };
      case 2:
        return { ...baseStyles, transform: 'rotate(-45deg) translateY(-6px)' };
      default:
        return baseStyles;
    }
  };

  return (
    <>
      {/* Main Navigation Island */}
      <Island
        variant="primary"
        elevation="low"
        size="sm"
        className="sticky top-4 z-50 mx-4"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex h-12 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button 
              className="flex items-center space-x-2 interactive-hover" 
              onClick={() => navigate('/')}
              aria-label="Navigate to homepage"
            >
              <div 
                className="h-6 w-6 rounded" 
                style={{ 
                  backgroundColor: 'var(--color-interactive-primary)',
                  transition: createTransition(['background-color'], 'normal'),
                }}
              />
              <span 
                className="font-bold text-lg"
                style={{ 
                  color: 'var(--color-text-primary)',
                  transition: createTransition(['color'], 'normal'),
                }}
              >
                AlgoBrain
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const isActive = getIsActive(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className="text-sm font-medium transition-colors interactive-hover"
                  style={navButtonStyles(isActive)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--color-interactive-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side - Theme Switcher and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1 interactive-hover"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <div 
                className="w-5 h-0.5 rounded-full"
                style={hamburgerLineStyles(0)}
              />
              <div 
                className="w-5 h-0.5 rounded-full"
                style={hamburgerLineStyles(1)}
              />
              <div 
                className="w-5 h-0.5 rounded-full"
                style={hamburgerLineStyles(2)}
              />
            </button>
          </div>
        </div>
      </Island>

      {/* Mobile Menu Overlay */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          transition: createTransition(['opacity'], 'normal'),
        }}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Navigation Menu */}
      <div
        className="md:hidden fixed top-20 left-4 right-4 z-50"
        style={mobileMenuStyles}
      >
        <Island
          variant="primary"
          elevation="high"
          size="sm"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <nav className="flex flex-col space-y-2">
            {navigationItems.map((item) => {
              const isActive = getIsActive(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className="text-left px-3 py-2 text-sm font-medium rounded transition-colors interactive-hover"
                  style={{
                    color: isActive 
                      ? 'var(--color-text-accent)' 
                      : 'var(--color-text-secondary)',
                    backgroundColor: isActive 
                      ? 'var(--color-interactive-primary)20' 
                      : 'transparent',
                    transition: createTransition(['color', 'background-color'], 'fast'),
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </Island>
      </div>
    </>
  );
};

export default NavigationIsland;