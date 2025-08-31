import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse } from './types';

interface AnthropicResponse {
  content: Array<{
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

interface AnthropicError {
  error?: {
    message?: string;
  };
}

export class AnthropicProvider extends BaseAIProvider {
  async call(request: AIRequest): Promise<AIResponse> {
    const { apiKey, model = 'claude-3-haiku-20240307' } = this.config;
    
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: request.maxTokens ?? 2000,
        temperature: request.temperature ?? 0.7,
        system: request.system ? this.formatSystemMessage(request.system) : undefined,
        messages: [
          { role: 'user', content: this.formatPrompt(request.prompt, request.json) }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } })) as AnthropicError;
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as AnthropicResponse;
    const content = data.content[0]?.text || '';
    
    return {
      content: this.validateResponse(content, request.json),
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
      provider: 'anthropic',
      model: data.model,
    };
  }
}
