/**
 * Security Engineer Agent - specialized in security audits, auth design, and vulnerability scanning
 */

import { AgentType, LLMRequest, LLMResponse } from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ SECURITY-SPECIFIC TYPES ============

export interface VulnerabilityReport {
  scannedFiles: string[];
  findings: SecurityFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

export interface SecurityFinding {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    file: string;
    line?: number;
    codeSnippet?: string;
  };
  description: string;
  remediation: string;
  owaspCategory?: string;
}

export interface AuthConfigSpec {
  type: 'jwt' | 'session' | 'oauth' | 'api-key';
  providers?: string[];
  tokenExpiration?: string;
  refreshToken?: boolean;
  passwordPolicy?: {
    minLength: number;
    requireUppercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  };
  mfa?: boolean;
}

export interface SecurityHeaderSpec {
  cors?: {
    origins: string[];
    methods: string[];
    credentials?: boolean;
  };
  csp?: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
  };
  hsts?: boolean;
  frameOptions?: 'DENY' | 'SAMEORIGIN';
  contentTypeOptions?: boolean;
}

export interface GeneratedSecurityCode {
  filename: string;
  content: string;
  type: 'config' | 'middleware' | 'utility';
}

// ============ SECURITY AGENT PROMPTS ============

const SEC_AUDIT_PROMPT = `You are a Security Engineer conducting a code audit.

Requirements:
- Analyze for OWASP Top 10 vulnerabilities
- Check for hardcoded secrets
- Identify injection risks (SQL, Command, XSS)
- Check for broken authentication/authorization
- Verify input validation
- Look for insecure configuration

For each finding, provide:
1. Severity (critical/high/medium/low)
2. Description of the vulnerability
3. Exact location in code
4. Recommended remediation code
5. Relevant OWASP category

Output as JSON.`;

const SEC_AUTH_PROMPT = `You are designing an authentication system.

Requirements:
- Follow secure authentication best practices
- Use industry standards (JWT, OAuth 2.0)
- Ensure secure password storage (bcrypt/argon2)
- Implement proper session management
- handle token lifecycle securely

Generate code for the requested auth configuration.`;

const SEC_HEADERS_PROMPT = `You are configuring security headers.

Requirements:
- Configure secure defaults (Helmet)
- Set up strict CSP based on requirements
- Configure correct CORS policy
- Enable HSTS for production
- protect against clickjacking

Generate the configuration or middleware code.`;

// ============ SECURITY ENGINEER AGENT ============

export class SecurityEngineerAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.SECURITY, {
      systemPrompt: getAgentPrompt(AgentType.SECURITY),
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'security_engineer',
    });
  }

  // ============ CODE AUDIT ============

  /**
   * Scan code for vulnerabilities
   */
  async reviewCode(
    files: Array<{ name: string; content: string }>,
  ): Promise<VulnerabilityReport> {
    this.updateProgress(10, 'Scanning code for vulnerabilities...');

    const fileContents = files
      .map((f) => `File: ${f.name}\n\`\`\`typescript\n${f.content}\n\`\`\``)
      .join('\n\n');

    const response = await this.callLLM({
      systemPrompt: SEC_AUDIT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Audit the following code for security issues:\n\n${fileContents}\n\nReturn a JSON report with findings and recommendations.`,
        },
      ],
      temperature: 0.1, // Low temp for analysis
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Security audit complete');

    return this.parseJSON<VulnerabilityReport>(response.content);
  }

  /**
   * Scan specific specialized vectors
   */
  async scanForInjection(
    code: string,
    type: 'sql' | 'nosql' | 'os' | 'xss',
  ): Promise<SecurityFinding[]> {
    const response = await this.callLLM({
      systemPrompt: `Analyze the code specifically for ${type.toUpperCase()} injection vulnerabilities. Return JSON array of findings.`,
      messages: [{ role: 'user', content: code }],
      temperature: 0.1,
    });

    return this.parseJSON<SecurityFinding[]>(response.content);
  }

  // ============ AUTH SYSTEM DESIGN ============

  /**
   * Generate authentication configuration and helpers
   */
  async designAuthSystem(
    spec: AuthConfigSpec,
  ): Promise<GeneratedSecurityCode[]> {
    this.updateProgress(10, `Designing ${spec.type} authentication system...`);

    const codes: GeneratedSecurityCode[] = [];

    // 1. Generate Config
    const configResp = await this.callLLM({
      systemPrompt: SEC_AUTH_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate configuration code for:
Type: ${spec.type}
Providers: ${spec.providers?.join(', ')}
Password Policy: ${JSON.stringify(spec.passwordPolicy)}
Token Expiration: ${spec.tokenExpiration}

Include environment variable validation.`,
        },
      ],
      temperature: 0.2,
    });

    codes.push({
      filename: 'auth-config.ts',
      content: this.extractCode(configResp.content),
      type: 'config',
    });

    // 2. Generate Utilities (hashing, tokens)
    this.updateProgress(50, 'Generating auth utilities...');
    const utilsResp = await this.callLLM({
      systemPrompt: SEC_AUTH_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate utility functions for:
- Password hashing (bcrypt)
- Token generation/verification
- Password validation against policy`,
        },
      ],
      temperature: 0.2,
    });

    codes.push({
      filename: 'auth-utils.ts',
      content: this.extractCode(utilsResp.content),
      type: 'utility',
    });

    this.updateProgress(100, 'Auth system design complete');
    return codes;
  }

  // ============ INPUT VALIDATION ============

  /**
   * Generate Zod validation schemas for inputs
   */
  async generateValidationRules(
    inputStructure: string,
    context: string,
  ): Promise<GeneratedSecurityCode> {
    this.updateProgress(10, 'Generating input validation rules...');

    const response = await this.callLLM({
      systemPrompt: 'Generate strict Zod validation schemas for security.',
      messages: [
        {
          role: 'user',
          content: `Generate Zod schemas for:
Structure: ${inputStructure}
Context: ${context}

Requirements:
- Validate types strictly
- Limit string lengths
- Sanitize inputs where appropriate
- Use regex for patterns (email, etc)
- Prevent prototype pollution`,
        },
      ],
      temperature: 0.2,
    });

    return {
      filename: 'input-validation.ts',
      content: this.extractCode(response.content),
      type: 'utility',
    };
  }

  // ============ SECURITY HEADERS ============

  /**
   * Configure security headers (Helmet, CORS)
   */
  async configureSecurityHeaders(
    spec: SecurityHeaderSpec,
  ): Promise<GeneratedSecurityCode> {
    this.updateProgress(10, 'Configuring security headers...');

    const response = await this.callLLM({
      systemPrompt: SEC_HEADERS_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate security header configuration for Fastify/Express:

CORS: ${JSON.stringify(spec.cors)}
CSP: ${JSON.stringify(spec.csp)}
HSTS: ${spec.hsts}
Frame Options: ${spec.frameOptions}

Include comments explaining each header's purpose.`,
        },
      ],
      temperature: 0.2,
    });

    this.updateProgress(100, 'Security headers configured');

    return {
      filename: 'security-headers.ts',
      content: this.extractCode(response.content),
      type: 'middleware',
    };
  }

  /**
   * Generate policy for Content Security Policy (CSP)
   */
  async generateCSP(resources: {
    scripts: string[];
    styles: string[];
    images: string[];
    apis: string[];
  }): Promise<string> {
    const response = await this.callLLM({
      systemPrompt: 'Generate a strict Content Security Policy string.',
      messages: [
        {
          role: 'user',
          content: `Allow these resources:
Scripts: ${resources.scripts.join(', ')}
Styles: ${resources.styles.join(', ')}
Images: ${resources.images.join(', ')}
Connect: ${resources.apis.join(', ')}

Everything else should be blocked.`,
        },
      ],
      temperature: 0.1,
    });

    return response.content.trim();
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
}
