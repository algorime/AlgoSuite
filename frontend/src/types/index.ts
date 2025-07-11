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

// DEPRECATED
// Payload Suggestion Types
export interface PayloadSuggestion {
  payload: string;
  type: 'boolean_blind' | 'union_based' | 'time_based' | 'error_based' | 'stacked_queries';
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  applicable_points: string[];
  target_parameter?: string;
  injection_point?: InjectionPoint;
  application_method?: 'replace' | 'append' | 'prepend';
  expected_result?: string;
}

// DEPRECATED
export interface InjectionPoint {
  location: 'url_parameter' | 'form_data' | 'json_body' | 'header';
  parameter: string;
  value: string;
  position: {
    type: string;
    parameter_name?: string;
    parameter_index?: number;
    key?: string;
    header_name?: string;
  };
  risk_level: 'low' | 'medium' | 'high';
}

// DEPRECATED
export interface VulnerabilityIndicator {
  type: 'sql_error_pattern' | 'database_error' | 'error_status_code';
  pattern?: string;
  match?: string;
  position?: number;
  severity: 'low' | 'medium' | 'high';
  database_type?: string;
  keyword?: string;
  status_code?: number;
}

// DEPRECATED
export interface PayloadRecommendation {
  injection_point: InjectionPoint;
  recommended_payload: string;
  full_test_url: string;
  reasoning: string;
  next_steps: string[];
}

// DEPRECATED
export interface PayloadAnalysisResult {
  injection_points: InjectionPoint[];
  payload_suggestions: PayloadSuggestion[];
  vulnerability_indicators: VulnerabilityIndicator[];
  recommended_payloads: PayloadRecommendation[];
}

export interface SimplifiedPayloadSuggestion {
  payload: string;
  description: string;
  source: string;
}

// Payload Suggestor Agent Types
export interface PayloadSuggestorRequest {
  request: HttpRequest;
  response: HttpResponse;
  user_message?: string;
}

export interface PayloadSuggestorResponse {
  analysis_result: PayloadAnalysisResult;
  agent_message: string;
  suggested_actions: string[];
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
  injection_point: InjectionPoint;
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