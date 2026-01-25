/**
 * AI/ML Specialist Agent - Implements RAG, vector operations, and AI features
 */

import { AgentType, LLMRequest, LLMResponse } from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ AI-SPECIFIC TYPES ============

export interface RAGConfigSpec {
  vectorStore: 'pinecone' | 'weaviate' | 'pgvector' | 'chroma';
  embeddingsModel:
    | 'openai-text-embedding-3-small'
    | 'huggingface'
    | 'gemini-embedding';
  chunkSize: number;
  chunkOverlap: number;
}

export interface PromptTemplateSpec {
  name: string;
  description: string;
  variables: string[];
  template: string;
  modelConfig?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface AIFeatureSpec {
  name: string;
  type:
    | 'classification'
    | 'summarization'
    | 'generation'
    | 'extraction'
    | 'chatbot';
  description: string;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  ragEnabled?: boolean;
}

export interface GeneratedAICode {
  filename: string;
  content: string;
  type: 'rag' | 'prompt' | 'feature' | 'utility';
}

// ============ AI AGENT PROMPTS ============

const AI_RAG_PROMPT = `You are an AI Engineer designing a RAG system.

Requirements:
- Implement vector store connection
- Create embedding generation logic
- Implement chunking strategy
- Add similarity search with relevance filtering
- Design the context injection mechanism

Generate the complete implementation code.
Output ONLY the code wrapped in a code block.`;

const AI_PROMPT_TEMPLATE_PROMPT = `You are designing prompt templates for LLM applications.

Requirements:
- Use clear and concise instructions
- Include variable placeholders
- Add few-shot examples if complex
- define system and user roles
- Optimize for the specific model (if specified)

Generate the prompt management code.
Output ONLY the code wrapped in a code block.`;

const AI_FEATURE_PROMPT = `You are implementing an AI-powered feature.

Requirements:
- Define the function signature
- Prepare the prompt with inputs
- Handle the LLM API call
- Parse and validate the output
- Handle errors and fallbacks

Generate the feature implementation.
Output ONLY the code wrapped in a code block.`;

// ============ AI/ML SPECIALIST AGENT ============

export class AIMLSpecialistAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.ARCHITECT, {
      // Using Architect as base since AI_SPECIALIST might not be in enum yet
      systemPrompt: `You are an AI/ML Specialist focusing on:
- Integration of Large Language Models (LLMs)
- RAG (Retrieval Augmented Generation) systems
- Vector databases and embeddings
- Prompt engineering and optimization
- AI feature implementation (chatbots, classifiers, etc.)

Prioritize reliability, latency, and cost-effectiveness in your designs.`,
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'ai_specialist',
    });
  }

  // ============ RAG SYSTEM GENERATION ============

  /**
   * Generate RAG pipeline configuration and code
   */
  async generateRAGPipeline(spec: RAGConfigSpec): Promise<GeneratedAICode[]> {
    this.updateProgress(
      10,
      `Generating RAG pipeline for ${spec.vectorStore}...`,
    );

    const codes: GeneratedAICode[] = [];

    // 1. Vector Store Setup
    const storeResp = await this.callLLM({
      systemPrompt: AI_RAG_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate vector store setup for:
Vector DB: ${spec.vectorStore}
Embedding Model: ${spec.embeddingsModel}

Include connection logic and index creation.`,
        },
      ],
      temperature: 0.2,
    });

    codes.push({
      filename: 'vector-store.ts',
      content: this.extractCode(storeResp.content),
      type: 'rag',
    });

    // 2. Ingestion Pipeline (Chunking + Embedding)
    this.updateProgress(40, 'Generating ingestion pipeline...');
    const ingestResp = await this.callLLM({
      systemPrompt: AI_RAG_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate document ingestion pipeline:
Chunk Size: ${spec.chunkSize}
Overlap: ${spec.chunkOverlap}

Include text splitter and embedding generation.`,
        },
      ],
      temperature: 0.2,
    });

    codes.push({
      filename: 'ingestion.ts',
      content: this.extractCode(ingestResp.content),
      type: 'rag',
    });

    // 3. Retrieval Logic
    this.updateProgress(70, 'Generating retrieval logic...');
    const retrieveResp = await this.callLLM({
      systemPrompt: AI_RAG_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate retrieval function:
- Similarity search
- Metadata filtering
- Context window construction`,
        },
      ],
      temperature: 0.2,
    });

    codes.push({
      filename: 'retriever.ts',
      content: this.extractCode(retrieveResp.content),
      type: 'rag',
    });

    this.updateProgress(100, 'RAG pipeline generated');
    return codes;
  }

  // ============ PROMPT ENGINEERING ============

  /**
   * Generate robust prompt templates
   */
  async generatePromptTemplate(
    spec: PromptTemplateSpec,
  ): Promise<GeneratedAICode> {
    this.updateProgress(10, `Designing prompt: ${spec.name}...`);

    const response = await this.callLLM({
      systemPrompt: AI_PROMPT_TEMPLATE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Create a typescript file exporting a prompt template object.

Name: ${spec.name}
Description: ${spec.description}
Variables: ${spec.variables.join(', ')}
Goal: ${spec.template}
Configuration: ${JSON.stringify(spec.modelConfig)}

Include type safety for variables.`,
        },
      ],
      temperature: 0.3,
    });

    this.updateProgress(100, 'Prompt template generated');

    return {
      filename: `${this.toKebabCase(spec.name)}-prompt.ts`,
      content: this.extractCode(response.content),
      type: 'prompt',
    };
  }

  /**
   * Optimize an existing prompt
   */
  async optimizePrompt(currentPrompt: string, goal: string): Promise<string> {
    const response = await this.callLLM({
      systemPrompt:
        'You are an expert Prompt Engineer. Optimize the prompt for better performance, clarity, and adherence to instructions.',
      messages: [
        {
          role: 'user',
          content: `Original Prompt:\n${currentPrompt}\n\nGoal:\n${goal}\n\nOptimize this prompt using techniques like Chain-of-Thought or structural formatting.`,
        },
      ],
      temperature: 0.5,
    });

    return response.content.trim();
  }

  // ============ AI FEATURE IMPLEMENTATION ============

  /**
   * Generate complete AI feature code
   */
  async generateAIFeature(spec: AIFeatureSpec): Promise<GeneratedAICode> {
    this.updateProgress(10, `Implementing AI feature: ${spec.name}...`);

    const response = await this.callLLM({
      systemPrompt: AI_FEATURE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Implement ${spec.type} feature: "${spec.name}"

Description: ${spec.description}
Inputs: ${JSON.stringify(spec.inputs)}
Outputs: ${JSON.stringify(spec.outputs)}
RAG Enabled: ${spec.ragEnabled ? 'Yes' : 'No'}

Generate a TypeScript function invoking the LLM client.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2500,
    });

    this.updateProgress(100, 'AI feature generated');

    return {
      filename: `${this.toKebabCase(spec.name)}.ts`,
      content: this.extractCode(response.content),
      type: 'feature',
    };
  }

  // ============ HELPERS ============

  /**
   * Extract code from markdown code blocks
   */
  private extractCode(content: string): string {
    const codeBlockMatch = content.match(
      /```(?:typescript|ts|javascript|js)?\n?([\s\S]*?)```/,
    );
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    return content.trim();
  }

  /**
   * Convert to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}
