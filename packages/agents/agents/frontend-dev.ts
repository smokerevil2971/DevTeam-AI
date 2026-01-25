/**
 * Frontend Developer Agent - Builds React components, pages, and UI
 */

import {
  AgentType,
  AgentTask,
  ProjectContext,
  LLMRequest,
  LLMResponse,
} from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ FE-SPECIFIC TYPES ============

export interface ComponentSpec {
  name: string;
  description: string;
  props: PropSpec[];
  hooks?: string[];
  styling?: 'tailwind' | 'css' | 'styled-components';
  accessibility?: boolean;
}

export interface PropSpec {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface PageSpec {
  name: string;
  route: string;
  description: string;
  components: string[];
  layout?: string;
  dataFetching?: 'server' | 'client' | 'hybrid';
  protected?: boolean;
}

export interface APIHookSpec {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestType?: string;
  responseType?: string;
  options?: {
    caching?: boolean;
    optimisticUpdate?: boolean;
    refetchOnFocus?: boolean;
  };
}

export interface StateStoreSpec {
  name: string;
  description: string;
  state: Array<{ name: string; type: string; default: string }>;
  actions: Array<{ name: string; params: string; description: string }>;
  persist?: boolean;
}

export interface GeneratedCode {
  filename: string;
  content: string;
  language: 'typescript' | 'tsx' | 'css';
}

// ============ FE AGENT PROMPTS ============

const FE_COMPONENT_PROMPT = `You are generating a React TypeScript component.

Requirements:
- Use functional components with TypeScript
- Define proper prop interfaces
- Use Tailwind CSS for styling
- Include accessibility attributes (aria-labels, roles)
- Add meaningful comments for complex logic
- Handle edge cases (empty states, loading, errors)

Generate the full component code including:
1. Imports
2. TypeScript interface for props
3. Component function with proper typing
4. JSX with Tailwind classes
5. Export statement

Output ONLY the code wrapped in a code block with the language tag.`;

const FE_PAGE_PROMPT = `You are generating a Next.js App Router page.

Requirements:
- Use TypeScript and React
- Include proper metadata for SEO
- Implement responsive design with Tailwind
- Handle loading and error states
- Use proper Next.js patterns (use client/server as appropriate)

Generate the full page code including:
1. Any 'use client' directive if needed
2. Imports
3. Component imports
4. Page component with proper layout
5. Export as default

Output ONLY the code wrapped in a code block with the language tag.`;

const FE_API_HOOK_PROMPT = `You are generating a React Query hook for API integration.

Requirements:
- Use @tanstack/react-query
- Include proper TypeScript types
- Handle loading, error, and success states
- Add proper query keys
- Include mutation hooks where needed

Generate hooks for the specified API endpoints.

Output ONLY the code wrapped in a code block with the language tag.`;

const FE_STORE_PROMPT = `You are generating a Zustand store.

Requirements:
- Use TypeScript with proper types
- Include persist middleware if needed
- Define clear actions and selectors
- Keep state normalized
- Include devtools for debugging

Output ONLY the code wrapped in a code block with the language tag.`;

// ============ FRONTEND DEVELOPER AGENT ============

export class FrontendDeveloperAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.FRONTEND_DEV, {
      systemPrompt: getAgentPrompt(AgentType.FRONTEND_DEV),
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'frontend_dev',
    });
  }

  // ============ COMPONENT GENERATION ============

  /**
   * Generate a React component from specification
   */
  async generateComponent(spec: ComponentSpec): Promise<GeneratedCode> {
    this.updateProgress(10, `Generating component: ${spec.name}...`);

    const propsDescription = spec.props
      .map(
        (p) =>
          `- ${p.name}: ${p.type}${p.required ? ' (required)' : ''} - ${p.description || ''}`,
      )
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: FE_COMPONENT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a React component with these specifications:

Name: ${spec.name}
Description: ${spec.description}

Props:
${propsDescription}

${spec.hooks ? `Required hooks: ${spec.hooks.join(', ')}` : ''}
Styling: ${spec.styling || 'tailwind'}
Accessibility: ${spec.accessibility !== false ? 'Yes, include a11y attributes' : 'Basic'}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
    });

    this.updateProgress(100, `Component ${spec.name} generated`);

    return {
      filename: `${this.toKebabCase(spec.name)}.tsx`,
      content: this.extractCode(response.content),
      language: 'tsx',
    };
  }

  /**
   * Generate multiple related components
   */
  async generateComponentFamily(
    baseName: string,
    variants: string[],
    sharedProps: PropSpec[],
  ): Promise<GeneratedCode[]> {
    const components: GeneratedCode[] = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      this.updateProgress(
        Math.round((i / variants.length) * 100),
        `Generating ${variant}...`,
      );

      const spec: ComponentSpec = {
        name: `${baseName}${variant}`,
        description: `${variant} variant of ${baseName}`,
        props: sharedProps,
      };

      const component = await this.generateComponent(spec);
      components.push(component);
    }

    // Generate index file
    const indexContent = variants
      .map(
        (v) =>
          `export { ${baseName}${v} } from './${this.toKebabCase(baseName + v)}';`,
      )
      .join('\n');

    components.push({
      filename: 'index.ts',
      content: indexContent,
      language: 'typescript',
    });

    return components;
  }

  // ============ PAGE GENERATION ============

  /**
   * Generate a Next.js page
   */
  async generatePage(spec: PageSpec): Promise<GeneratedCode> {
    this.updateProgress(10, `Generating page: ${spec.name}...`);

    const response = await this.callLLM({
      systemPrompt: FE_PAGE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a Next.js page with these specifications:

Name: ${spec.name}
Route: ${spec.route}
Description: ${spec.description}

Components to include: ${spec.components.join(', ')}
Layout: ${spec.layout || 'Default layout'}
Data Fetching: ${spec.dataFetching || 'client'}
Authentication Required: ${spec.protected ? 'Yes' : 'No'}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
    });

    this.updateProgress(100, `Page ${spec.name} generated`);

    return {
      filename: 'page.tsx',
      content: this.extractCode(response.content),
      language: 'tsx',
    };
  }

  /**
   * Generate a page with its route structure
   */
  async generatePageWithRoute(spec: PageSpec): Promise<{
    page: GeneratedCode;
    layout?: GeneratedCode;
    loading?: GeneratedCode;
    error?: GeneratedCode;
  }> {
    const result: {
      page: GeneratedCode;
      layout?: GeneratedCode;
      loading?: GeneratedCode;
      error?: GeneratedCode;
    } = {
      page: await this.generatePage(spec),
    };

    // Generate loading state
    this.updateProgress(40, 'Generating loading state...');
    const loadingResponse = await this.callLLM({
      systemPrompt: FE_PAGE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a loading.tsx file for the ${spec.name} page with skeleton loaders.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1024,
    });

    result.loading = {
      filename: 'loading.tsx',
      content: this.extractCode(loadingResponse.content),
      language: 'tsx',
    };

    // Generate error boundary
    this.updateProgress(70, 'Generating error boundary...');
    const errorResponse = await this.callLLM({
      systemPrompt: FE_PAGE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate an error.tsx file for the ${spec.name} page with a user-friendly error message and retry button.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1024,
    });

    result.error = {
      filename: 'error.tsx',
      content: this.extractCode(errorResponse.content),
      language: 'tsx',
    };

    this.updateProgress(100, 'Page structure generated');
    return result;
  }

  // ============ API INTEGRATION ============

  /**
   * Generate React Query hooks for API endpoints
   */
  async generateAPIHooks(hooks: APIHookSpec[]): Promise<GeneratedCode> {
    this.updateProgress(10, 'Generating API hooks...');

    const hookDescriptions = hooks
      .map(
        (h) =>
          `- ${h.name}: ${h.method} ${h.endpoint}
   Request: ${h.requestType || 'void'}
   Response: ${h.responseType || 'unknown'}
   Options: ${JSON.stringify(h.options || {})}`,
      )
      .join('\n\n');

    const response = await this.callLLM({
      systemPrompt: FE_API_HOOK_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate React Query hooks for these API endpoints:

${hookDescriptions}

Include:
- Proper TypeScript types
- Query and mutation hooks
- Loading and error handling
- Optimistic updates where specified`,
        },
      ],
      temperature: 0.3,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'API hooks generated');

    return {
      filename: 'use-api.ts',
      content: this.extractCode(response.content),
      language: 'typescript',
    };
  }

  /**
   * Parse an API contract and generate hooks
   */
  async parseAndGenerateHooks(apiContract: string): Promise<GeneratedCode> {
    this.updateProgress(10, 'Parsing API contract...');

    // First, parse the contract to extract endpoints
    const parseResponse = await this.callLLM({
      systemPrompt:
        'Extract API endpoints from the contract. Return as JSON array with name, endpoint, method, requestType, responseType.',
      messages: [{ role: 'user', content: apiContract }],
      temperature: 0.1,
      maxTokens: 1024,
    });

    const endpoints = this.parseJSON<APIHookSpec[]>(parseResponse.content);

    // Then generate the hooks
    return this.generateAPIHooks(endpoints);
  }

  // ============ STATE MANAGEMENT ============

  /**
   * Generate a Zustand store
   */
  async generateStore(spec: StateStoreSpec): Promise<GeneratedCode> {
    this.updateProgress(10, `Generating store: ${spec.name}...`);

    const stateFields = spec.state
      .map((s) => `- ${s.name}: ${s.type} = ${s.default}`)
      .join('\n');

    const actionDescriptions = spec.actions
      .map((a) => `- ${a.name}(${a.params}): ${a.description}`)
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: FE_STORE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a Zustand store with these specifications:

Name: ${spec.name}
Description: ${spec.description}

State:
${stateFields}

Actions:
${actionDescriptions}

Persistence: ${spec.persist ? 'Yes, use persist middleware' : 'No'}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
    });

    this.updateProgress(100, `Store ${spec.name} generated`);

    return {
      filename: `${this.toKebabCase(spec.name)}.ts`,
      content: this.extractCode(response.content),
      language: 'typescript',
    };
  }

  /**
   * Identify state needs from component requirements
   */
  async identifyStateNeeds(requirements: string): Promise<StateStoreSpec[]> {
    const response = await this.callLLM({
      systemPrompt: `Analyze the requirements and identify what state stores are needed.
Return as JSON array with name, description, state (array of {name, type, default}), actions (array of {name, params, description}), persist (boolean).`,
      messages: [{ role: 'user', content: requirements }],
      temperature: 0.3,
      maxTokens: 2048,
    });

    return this.parseJSON<StateStoreSpec[]>(response.content);
  }

  // ============ CODE REVIEW RESPONSE ============

  /**
   * Parse code review feedback and generate fixes
   */
  async respondToReview(
    originalCode: string,
    reviewFeedback: string,
  ): Promise<{ fixedCode: string; explanation: string }> {
    this.updateProgress(10, 'Analyzing review feedback...');

    const response = await this.callLLM({
      systemPrompt: `You are responding to a code review. 
Analyze the feedback and fix the code accordingly.
Respond with:
1. The fixed code in a code block
2. A brief explanation of changes made`,
      messages: [
        {
          role: 'user',
          content: `Original code:
\`\`\`tsx
${originalCode}
\`\`\`

Review feedback:
${reviewFeedback}

Please fix the issues and explain the changes.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Review response generated');

    const fixedCode = this.extractCode(response.content);
    const explanation = response.content.replace(/```[\s\S]*?```/g, '').trim();

    return { fixedCode, explanation };
  }

  /**
   * Refactor code based on suggestions
   */
  async refactorCode(
    code: string,
    refactorType: 'performance' | 'accessibility' | 'readability' | 'hooks',
  ): Promise<GeneratedCode> {
    const instructions: Record<string, string> = {
      performance:
        'Optimize for performance: useMemo, useCallback, lazy loading',
      accessibility:
        'Improve accessibility: aria attributes, keyboard navigation, focus management',
      readability:
        'Improve readability: better naming, comments, code organization',
      hooks: 'Extract logic into custom hooks for reusability',
    };

    const response = await this.callLLM({
      systemPrompt: `Refactor the React code. ${instructions[refactorType]}`,
      messages: [
        {
          role: 'user',
          content: `Refactor this code for ${refactorType}:\n\n${code}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 3000,
    });

    return {
      filename: 'refactored.tsx',
      content: this.extractCode(response.content),
      language: 'tsx',
    };
  }

  // ============ HELPERS ============

  /**
   * Extract code from markdown code blocks
   */
  private extractCode(content: string): string {
    const codeBlockMatch = content.match(
      /```(?:tsx?|javascript|jsx)?\n?([\s\S]*?)```/,
    );
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    return content.trim();
  }

  /**
   * Parse JSON from LLM response
   */
  private parseJSON<T>(content: string): T {
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    return JSON.parse(cleaned.trim());
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
