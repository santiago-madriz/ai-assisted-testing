import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse } from './types';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

interface OpenAIError {
  error?: {
    message?: string;
  };
}

export class OpenAIProvider extends BaseAIProvider {
  async call(request: AIRequest): Promise<AIResponse> {
    const { apiKey, model = 'gpt-4o-mini' } = this.config;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(request.system ? [{ role: 'system', content: this.formatSystemMessage(request.system) }] : []),
          { role: 'user', content: this.formatPrompt(request.prompt, request.json) }
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        ...(request.json ? { response_format: { type: 'json_object' } } : {})
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } })) as OpenAIError;
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    const content = data.choices[0]?.message?.content || '';
    
    return {
      content: this.validateResponse(content, request.json),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      provider: 'openai',
      model: data.model,
    };
  }
}
