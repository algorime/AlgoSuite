import React from 'react';
import { Island } from '../ui/Island.js';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center mb-6 ${className}`}>
      <div className="max-w-md">
        <Island
          variant="accent"
          size="lg"
          elevation="low"
          className="welcome-message-island"
          style={{
            backgroundColor: 'var(--color-island-background)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            border: '1px solid var(--color-island-border)',
            transition: 'all var(--transition-duration-normal) var(--transition-easing)',
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-interactive-primary)' }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <path d="M13 8H7"/>
                  <path d="M17 12H7"/>
                </svg>
              </div>
            </div>
            
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Welcome to AlgoBrain
            </h3>
            
            <p 
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Your AI-powered penetration testing assistant. Start by asking about SQL injection vulnerabilities, web security assessments, or any security-related questions.
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                "SQL injection basics",
                "Vulnerability assessment",
                "Security testing tips"
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-island-border)',
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </Island>
      </div>
    </div>
  );
};

export default WelcomeMessage;