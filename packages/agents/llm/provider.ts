/**
 * LLM Provider - Abstract interface and implementations for LLM providers
 */

import { LLMRequest, LLMResponse, LLMMessage } from '../types';

// ============ PROVIDER INTERFACE ============

export interface LLMProviderConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  baseUrl?: string;
  timeout?: number;
}

export interface LLMProviderInterface {
  name: string;
  config: LLMProviderConfig;

  /**
   * Send a completion request
   */
  complete(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Send a streaming completion request
   */
  stream(request: LLMRequest): AsyncGenerator<string, void, unknown>;

  /**
   * Count tokens in a message
   */
  countTokens(text: string): number;

  /**
   * Check if the provider is available
   */
  isAvailable(): Promise<boolean>;
}

// ============ BASE PROVIDER ============

export abstract class BaseLLMProvider implements LLMProviderInterface {
  name: string;
  config: LLMProviderConfig;

  constructor(name: string, config: LLMProviderConfig) {
    this.name = name;
    this.config = {
      maxTokens: 4096,
      temperature: 0.7,
      timeout: 60000,
      ...config,
    };
  }

  abstract complete(request: LLMRequest): Promise<LLMResponse>;
  abstract stream(request: LLMRequest): AsyncGenerator<string, void, unknown>;

  /**
   * Basic token counting (rough approximation)
   * Subclasses can override with provider-specific tokenizers
   */
  countTokens(text: string): number {
    // Rough approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Try a minimal request
      await this.complete({
        systemPrompt: 'Respond with "ok"',
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format messages for the provider
   */
  protected formatMessages(request: LLMRequest): LLMMessage[] {
    const messages: LLMMessage[] = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push(...request.messages);

    return messages;
  }
}

// ============ GEMINI PROVIDER ============

export class GeminiProvider extends BaseLLMProvider {
  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string }) {
    super('gemini', {
      ...config,
      model: config.model || 'gemini-2.0-flash',
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const contents = this.formatGeminiMessages(request);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: request.systemPrompt
          ? { parts: [{ text: request.systemPrompt }] }
          : undefined,
        generationConfig: {
          temperature: request.temperature ?? this.config.temperature,
          maxOutputTokens: request.maxTokens ?? this.config.maxTokens,
          stopSequences: request.stopSequences,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      finishReason: this.mapFinishReason(data.candidates?.[0]?.finishReason),
    };
  }

  async *stream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:streamGenerateContent?key=${this.config.apiKey}`;

    const contents = this.formatGeminiMessages(request);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: request.systemPrompt
          ? { parts: [{ text: request.systemPrompt }] }
          : undefined,
        generationConfig: {
          temperature: request.temperature ?? this.config.temperature,
          maxOutputTokens: request.maxTokens ?? this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse JSON chunks
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        }
      }
    }
  }

  private formatGeminiMessages(
    request: LLMRequest,
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    return request.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  private mapFinishReason(reason?: string): 'stop' | 'length' | 'error' {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      default:
        return 'stop';
    }
  }
}

// ============ OPENAI PROVIDER ============

export class OpenAIProvider extends BaseLLMProvider {
  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string }) {
    super('openai', {
      ...config,
      model: config.model || 'gpt-4-turbo-preview',
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const messages = this.formatMessages(request);

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        stop: request.stopSequences,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason:
        data.choices[0]?.finish_reason === 'length' ? 'length' : 'stop',
    };
  }

  async *stream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const messages = this.formatMessages(request);

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.choices?.[0]?.delta?.content;
            if (text) yield text;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }
}

// ============ CLAUDE PROVIDER ============

export class ClaudeProvider extends BaseLLMProvider {
  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string }) {
    super('claude', {
      ...config,
      model: config.model || 'claude-3-5-sonnet-20241022',
      baseUrl: config.baseUrl || 'https://api.anthropic.com',
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        system: request.systemPrompt,
        messages: request.messages.map((m) => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? this.config.temperature,
        stop_sequences: request.stopSequences,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens:
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      finishReason: data.stop_reason === 'max_tokens' ? 'length' : 'stop',
    };
  }

  async *stream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        system: request.systemPrompt,
        messages: request.messages.map((m) => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? this.config.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta') {
              const text = data.delta?.text;
              if (text) yield text;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }
}

// ============ PROVIDER FACTORY ============

export type ProviderType = 'gemini' | 'openai' | 'claude';

export function createProvider(
  type: ProviderType,
  config: Omit<LLMProviderConfig, 'model'> & { model?: string },
): LLMProviderInterface {
  switch (type) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'claude':
      return new ClaudeProvider(config);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}
