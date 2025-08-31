import { AIRequest, AIResponse, AIProviderConfig } from './types';

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract call(request: AIRequest): Promise<AIResponse>;

  protected formatSystemMessage(system?: string): string {
    if (!system) return '';
    return system.trim();
  }

  protected formatPrompt(prompt: string, json?: boolean): string {
    let formatted = prompt.trim();
    
    if (json) {
      formatted += '\n\nPlease respond with valid JSON only. Do not include any markdown formatting or additional text.';
    }
    
    return formatted;
  }

  protected validateResponse(content: string, expectJson?: boolean): string {
    if (!expectJson) return content;

    try {
      // Try to parse as JSON to validate
      JSON.parse(content);
      return content;
    } catch (error) {
      throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
