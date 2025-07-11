import { useState } from 'react';
import StudioInterface from './components/studio/StudioInterface';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'dashboard' | 'studio'>('chat');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <div className="h-6 w-6 bg-blue-600 rounded" />
              <span className="font-bold text-white">AlgoBrain</span>
            </a>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`transition-colors hover:text-white ${
                activeTab === 'chat' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`transition-colors hover:text-white ${
                activeTab === 'editor' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Payload Editor
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors hover:text-white ${
                activeTab === 'dashboard' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`transition-colors hover:text-white ${
                activeTab === 'studio' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Studio
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${activeTab === 'studio' ? 'h-[calc(100vh-4rem)]' : 'container mx-auto py-6 px-4'}`}>
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">Chat Interface</h1>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Chat</h2>
              <p className="text-blue-700 dark:text-blue-300">Chat with the AI penetration testing assistant...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'editor' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">Payload Editor</h1>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">SQL Injection Payloads</h2>
              <p className="text-green-700 dark:text-green-300">Craft and test SQL injection payloads...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">Vulnerability Analysis</h2>
              <p className="text-purple-700 dark:text-purple-300">View charts and analytics for discovered vulnerabilities...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'studio' && (
          <StudioInterface />
        )}
      </main>
    </div>
  );
}

export default App;