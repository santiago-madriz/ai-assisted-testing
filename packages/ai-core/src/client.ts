import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { FallbackProvider } from './fallback-provider';
import { BaseAIProvider } from './base-provider';
import { AIProvider, AIProviderConfig, AIRequest, AIResponse } from './types';

export class AIClient {
  private provider: BaseAIProvider;

  constructor(config: AIProviderConfig) {
    this.provider = this.createProvider(config);
  }

  private createProvider(config: AIProviderConfig): BaseAIProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'azure':
        // Azure implementation would go here
        throw new Error('Azure provider not yet implemented');
      case 'local':
        // Local provider implementation would go here
        throw new Error('Local provider not yet implemented');
      case 'none':
      default:
        return new FallbackProvider(config);
    }
  }

  async call(request: AIRequest): Promise<AIResponse> {
    try {
      return await this.provider.call(request);
    } catch (error) {
      console.error('AI Provider error:', error);
      
      // Fallback to rule-based if the main provider fails
      if (this.provider.constructor.name !== 'FallbackProvider') {
        console.log('Falling back to rule-based provider...');
        const fallbackProvider = new FallbackProvider({ provider: 'none' });
        return await fallbackProvider.call(request);
      }
      
      throw error;
    }
  }
}

// Factory function for easy instantiation
export function createAIClient(): AIClient {
  const provider = (process.env.AI_PROVIDER || 'none') as AIProvider;
  
  const config: AIProviderConfig = {
    provider,
    apiKey: getApiKey(provider),
    model: getModel(provider),
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  };

  return new AIClient(config);
}

function getApiKey(provider: AIProvider): string | undefined {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'azure':
      return process.env.AZURE_OPENAI_API_KEY;
    default:
      return undefined;
  }
}

function getModel(provider: AIProvider): string | undefined {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_MODEL || 'gpt-4o-mini';
    case 'anthropic':
      return process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
    default:
      return undefined;
  }
}
