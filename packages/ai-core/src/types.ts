export interface AIRequest {
  system?: string;
  prompt: string;
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model?: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'azure' | 'local' | 'none';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  endpoint?: string;
  deploymentName?: string;
}
