// API and Chat related types
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

// HTTP Request/Response types
export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface HttpResponse {
  status_code: number;
  headers: Record<string, string>;
  body: string;
}

// Payload and Security types
export interface PayloadSuggestion {
  payload: string;
  type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  expected_result?: string;
}

export interface InjectionPoint {
  parameter: string;
  location: 'url' | 'header' | 'body';
  value: string;
  type: string;
}

export interface PayloadAnalysisResult {
  injection_points: InjectionPoint[];
  suggested_payloads: PayloadSuggestion[];
  risk_assessment: string;
}

export interface PayloadApplication {
  payload: PayloadSuggestion;
  injection_point: InjectionPoint;
  applied_at: Date;
}

export interface PayloadApplicatorResult {
  success: boolean;
  modified_request: HttpRequest;
  applied_payload: PayloadApplication;
  preview: string;
  error?: string;
}

// Dashboard and Visualization types
export interface VulnerabilityData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  endpoint: string;
  discovered_at: Date;
  status: 'new' | 'confirmed' | 'false_positive' | 'fixed';
}