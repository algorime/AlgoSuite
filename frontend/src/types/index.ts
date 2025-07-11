export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'vulnerability';
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error?: string;
}

export interface VulnerabilityData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  payload?: string;
  url?: string;
  timestamp: Date;
}

export interface AgentResponse {
  response: string;
  vulnerabilities?: VulnerabilityData[];
  recommendations?: string[];
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// HTTP Request/Response Types for Payload Suggestor
export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  positions?: PositionMarker[];
}

export interface HttpResponse {
  status_code: number;
  headers: Record<string, string>;
  body: string;
}

export interface PositionMarker {
  id: string;
  location: 'url' | 'header' | 'body' | 'url_parameter' | 'form_data' | 'json_body';
  field?: string;
  startIndex: number;
  endIndex: number;
  type: 'parameter' | 'value' | 'path';
  description?: string;
}

// Payload Suggestion Types
export interface PayloadSuggestion {
  payload: string;
  description: string;
  source: string;
  type: string;
  risk_level: string;
  expected_result?: string;
}

// Payload Suggestor Agent Types
export interface PayloadSuggestorRequest {
  request: HttpRequest;
  response: HttpResponse;
  user_message?: string;
}

export interface PayloadSuggestorResponse {
  suggestions: PayloadSuggestion[];
  agent_message: string;
}

// Studio Interface Types
export interface StudioState {
  httpRequest: HttpRequest;
  httpResponse: HttpResponse;
  payloadSuggestions: PayloadSuggestion[];
  selectedPayload: PayloadSuggestion | null;
  chatMessages: Message[];
  isAnalyzing: boolean;
}

// Payload Application Types
export interface PayloadApplication {
  id: string;
  payload: PayloadSuggestion;
  applied_at: Date;
  original_value: string;
  modified_value: string;
  success: boolean;
  error?: string;
}

export interface PayloadApplicatorResult {
  success: boolean;
  modified_request: HttpRequest;
  applied_payload: PayloadApplication;
  error?: string;
  preview?: string;
}