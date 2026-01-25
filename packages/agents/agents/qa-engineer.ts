/**
 * QA Engineer Agent - Generates tests, analyzes coverage, and ensures quality
 */

import { AgentType, LLMRequest, LLMResponse } from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ QA-SPECIFIC TYPES ============

export interface TestSuiteSpec {
  framework: 'jest' | 'playwright' | 'vitest';
  type: 'unit' | 'integration' | 'e2e';
  targets: Array<{ path: string; content?: string }>;
  coverageTarget?: number;
}

export interface TestCase {
  description: string;
  type: 'happy-path' | 'edge-case' | 'error-handling';
  code: string;
}

export interface GeneratedTest {
  filename: string;
  content: string;
  type: 'unit' | 'integration' | 'e2e';
}

export interface CoverageReport {
  summary: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  fileReports: Array<{
    file: string;
    metrics: { lines: number };
    uncoveredLines: number[];
  }>;
  suggestions: string[];
}

export interface TestPlan {
  unitTests: string[];
  integrationTests: string[];
  e2eScenarios: string[];
  focusAreas: string[];
}

// ============ QA AGENT PROMPTS ============

const QA_UNIT_TEST_PROMPT = `You are a QA Engineer writing unit tests.

Requirements:
- Use Vitest/Jest best practices
- Follow AAA (Arrange-Act-Assert) pattern
- Mock external dependencies
- Cover happy paths, edge cases, and errors
- Achieve high code coverage

Generate a complete test file with imports and test suite.
Output ONLY the code wrapped in a code block.`;

const QA_INTEGRATION_TEST_PROMPT = `You are writing integration tests for an API.

Requirements:
- Use Supertest or similar library
- Test request/response cycles
- Verify database state changes
- Handle authentication
- Clean up test data after execution

Generate complete test suite.
Output ONLY the code wrapped in a code block.`;

const QA_E2E_TEST_PROMPT = `You are writing Playwright E2E tests.

Requirements:
- Use Page Object Model pattern
- Use robust selectors (user-visible locators)
- Handle asynchronous operations
- Test full user flows
- Includes setup and teardown

Generate complete test file.
Output ONLY the code wrapped in a code block.`;

// ============ QA ENGINEER AGENT ============

export class QAEngineerAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.QA_ENGINEER, {
      systemPrompt: getAgentPrompt(AgentType.QA_ENGINEER),
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'qa_engineer',
    });
  }

  // ============ UNIT TESTING ============

  /**
   * Generate unit tests for a file
   */
  async generateUnitTests(
    filePath: string,
    code: string,
    framework: 'vitest' | 'jest' = 'vitest',
  ): Promise<GeneratedTest> {
    this.updateProgress(10, `Generating unit tests for ${filePath}...`);

    const response = await this.callLLM({
      systemPrompt: QA_UNIT_TEST_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate ${framework} unit tests for this code:

File: ${filePath}
Code:
\`\`\`typescript
${code}
\`\`\`

Include:
1. Happy path tests
2. Edge case handling
3. Error scenarios
4. Mocking where appropriate`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Unit tests generated');

    return {
      filename: filePath.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1'),
      content: this.extractCode(response.content),
      type: 'unit',
    };
  }

  /**
   * Analyze code to suggest test cases
   */
  async generateTestCases(code: string): Promise<TestCase[]> {
    const response = await this.callLLM({
      systemPrompt:
        'Generate a list of test cases for the given code. Return JSON array.',
      messages: [{ role: 'user', content: code }],
      temperature: 0.3,
      maxTokens: 2000,
    });

    return this.parseJSON<TestCase[]>(response.content);
  }

  // ============ INTEGRATION TESTING ============

  /**
   * Generate integration tests for API endpoints
   */
  async generateIntegrationTests(
    endpoints: Array<{ method: string; path: string; description: string }>,
    framework: 'vitest' | 'jest' = 'vitest',
  ): Promise<GeneratedTest> {
    this.updateProgress(10, 'Generating integration tests...');

    const endpointDesc = endpoints
      .map((e) => `- ${e.method} ${e.path}: ${e.description}`)
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: QA_INTEGRATION_TEST_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate integration tests using ${framework} and supertest for:

${endpointDesc}

Ensure tests cover:
- Successful requests
- Validation errors
- Authentication failures
- Database persistence check`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Integration tests generated');

    return {
      filename: 'api.integration.test.ts',
      content: this.extractCode(response.content),
      type: 'integration',
    };
  }

  // ============ E2E TESTING ============

  /**
   * Generate Playwright E2E tests for a user flow
   */
  async generateE2ETest(
    featureName: string,
    userFlow: string[],
  ): Promise<GeneratedTest> {
    this.updateProgress(10, `Generating E2E tests for ${featureName}...`);

    const response = await this.callLLM({
      systemPrompt: QA_E2E_TEST_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate Playwright test for feature "${featureName}".

User Flow:
${userFlow.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Include:
- Page Object Model (if complex)
- Setup (login/seed)
- Assertions
- Accessibility check (axe-core)`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'E2E tests generated');

    return {
      filename: `${this.toKebabCase(featureName)}.spec.ts`,
      content: this.extractCode(response.content),
      type: 'e2e',
    };
  }

  // ============ COVERAGE ANALYSIS ============

  /**
   * Analyze test coverage and suggest improvements
   */
  async analyzeCoverage(
    code: string,
    existingTests: string,
  ): Promise<CoverageReport> {
    this.updateProgress(10, 'Analyzing code coverage...');

    const response = await this.callLLM({
      systemPrompt: `Analyze test coverage gaps.
Return JSON report with metrics and uncovered lines/logic.`,
      messages: [
        {
          role: 'user',
          content: `Code:\n${code}\n\nTests:\n${existingTests}\n\nAnalyze missing coverage.`,
        },
      ],
      temperature: 0.1,
      maxTokens: 2000,
    });

    this.updateProgress(100, 'Analysis complete');

    return this.parseJSON<CoverageReport>(response.content);
  }

  /**
   * Create a comprehensive test plan
   */
  async createTestPlan(
    requirements: string,
    architecture: string,
  ): Promise<TestPlan> {
    this.updateProgress(10, 'Creating test plan...');

    const response = await this.callLLM({
      systemPrompt: `Create a test plan covering Unit, Integration, and E2E levels.
Return JSON with arrays of test descriptions.`,
      messages: [
        {
          role: 'user',
          content: `Requirements:\n${requirements}\n\nArchitecture:\n${architecture}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    return this.parseJSON<TestPlan>(response.content);
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
