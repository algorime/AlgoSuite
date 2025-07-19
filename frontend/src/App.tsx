import { useState } from 'react';
import StudioInterface from './components/studio/StudioInterface';
import ThemeSwitcher from './components/ui/ThemeSwitcher';
import AnimationDemo from './components/ui/AnimationDemo';
import { IslandDemo } from './components/ui/IslandDemo';
import { useTheme } from './hooks/useTheme.js';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'dashboard' | 'studio' | 'animations' | 'islands'>('islands');
  const { resolvedTheme } = useTheme();

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'var(--color-bg-gradient)',
        transition: 'background var(--transition-duration-normal) var(--transition-easing)'
      }}
    >
      {/* Header */}
      <header 
        className="border-b backdrop-blur"
        style={{
          borderColor: 'var(--color-island-border)',
          backgroundColor: 'var(--color-island-bg)',
          boxShadow: 'var(--shadow-low)'
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <div className="mr-4 flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <div 
                  className="h-6 w-6 rounded" 
                  style={{ backgroundColor: 'var(--color-interactive-primary)' }}
                />
                <span 
                  className="font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  AlgoBrain
                </span>
              </a>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('chat')}
                className="transition-colors"
                style={{
                  color: activeTab === 'chat' 
                    ? 'var(--color-text-accent)' 
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'chat') {
                    e.currentTarget.style.color = 'var(--color-interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'chat') {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className="transition-colors"
                style={{
                  color: activeTab === 'editor' 
                    ? 'var(--color-text-accent)' 
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'editor') {
                    e.currentTarget.style.color = 'var(--color-interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'editor') {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                Payload Editor
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="transition-colors"
                style={{
                  color: activeTab === 'dashboard' 
                    ? 'var(--color-text-accent)' 
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'dashboard') {
                    e.currentTarget.style.color = 'var(--color-interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'dashboard') {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('studio')}
                className="transition-colors"
                style={{
                  color: activeTab === 'studio' 
                    ? 'var(--color-text-accent)' 
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'studio') {
                    e.currentTarget.style.color = 'var(--color-interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'studio') {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                Studio
              </button>
              <button
                onClick={() => setActiveTab('animations')}
                className="transition-colors"
                style={{
                  color: activeTab === 'animations' 
                    ? 'var(--color-text-accent)' 
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'animations') {
                    e.currentTarget.style.color = 'var(--color-interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'animations') {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                Animations
              </button>
              <button
                onClick={() => setActiveTab('islands')}
                className="transition-colors"
                style={{
                  color: activeTab === 'islands' 
                    ? 'var(--color-text-accent)' 
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'islands') {
                    e.currentTarget.style.color = 'var(--color-interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'islands') {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                Islands
              </button>
            </nav>
          </div>
          
          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className={`${activeTab === 'studio' ? 'h-[calc(100vh-4rem)]' : 'container mx-auto py-6 px-4'}`}>
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Chat Interface
            </h1>
            <div 
              className="island p-6"
              style={{
                backgroundColor: 'var(--color-island-bg)',
                borderColor: 'var(--color-interactive-primary)',
                borderWidth: '1px',
              }}
            >
              <h2 
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--color-interactive-primary)' }}
              >
                AI Chat
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Chat with the AI penetration testing assistant...
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'editor' && (
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Payload Editor
            </h1>
            <div 
              className="island p-6"
              style={{
                backgroundColor: 'var(--color-island-bg)',
                borderColor: '#10b981',
                borderWidth: '1px',
              }}
            >
              <h2 
                className="text-xl font-semibold mb-2"
                style={{ color: '#10b981' }}
              >
                SQL Injection Payloads
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Craft and test SQL injection payloads...
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Dashboard
            </h1>
            <div 
              className="island p-6"
              style={{
                backgroundColor: 'var(--color-island-bg)',
                borderColor: '#8b5cf6',
                borderWidth: '1px',
              }}
            >
              <h2 
                className="text-xl font-semibold mb-2"
                style={{ color: '#8b5cf6' }}
              >
                Vulnerability Analysis
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                View charts and analytics for discovered vulnerabilities...
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'studio' && (
          <StudioInterface />
        )}
        
        {activeTab === 'animations' && (
          <AnimationDemo />
        )}
        
        {activeTab === 'islands' && (
          <IslandDemo />
        )}
      </main>
    </div>
  );
}

export default App;