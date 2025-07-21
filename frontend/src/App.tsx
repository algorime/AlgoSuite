import { useState } from 'react';
import StudioIslandWrapper from './components/studio/StudioIslandWrapper';
import ChatIslandWrapper from './components/chat/ChatIslandWrapper';
import EditorIslandWrapper from './components/editor/EditorIslandWrapper';
import DashboardIslandWrapper from './components/dashboard/DashboardIslandWrapper';
import AnimationDemo from './components/ui/AnimationDemo';
import { IslandDemo } from './components/ui/IslandDemo';
import ButtonDemo from './components/ui/ButtonDemo';
import NavigationIsland, { type NavigationTab } from './components/ui/NavigationIsland';
import { useTheme } from './hooks/useTheme.js';

function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('islands');
  const { } = useTheme();

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'var(--color-bg-gradient)',
        transition: 'background var(--transition-duration-normal) var(--transition-easing)'
      }}
    >
      {/* Navigation Island */}
      <NavigationIsland 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className={`${activeTab === 'studio' ? 'h-[calc(100vh-5rem)] pt-20' : 'container mx-auto pt-20 pb-6 px-4'}`}>
        <div 
          className="content-transition-wrapper"
          style={{
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'opacity var(--transition-duration-normal) var(--transition-easing), transform var(--transition-duration-normal) var(--transition-easing)'
          }}
        >
          {activeTab === 'chat' && (
            <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] content-island-container">
              <ChatIslandWrapper className="h-full" />
            </div>
          )}
          
          {activeTab === 'editor' && (
            <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] content-island-container">
              <EditorIslandWrapper className="h-full" />
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto content-island-container">
              <DashboardIslandWrapper />
            </div>
          )}
          
          {activeTab === 'studio' && (
            <div className="h-full content-island-container">
              <StudioIslandWrapper className="h-full" />
            </div>
          )}
          
          {activeTab === 'animations' && (
            <div className="content-island-container">
              <AnimationDemo />
            </div>
          )}
          
          {activeTab === 'islands' && (
            <div className="content-island-container">
              <IslandDemo />
            </div>
          )}
          
          {activeTab === 'buttons' && (
            <div className="content-island-container">
              <ButtonDemo />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;