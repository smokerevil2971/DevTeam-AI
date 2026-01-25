/**
 * Backend Developer Agent - Builds APIs, database operations, and business logic
 */

import { AgentType, LLMRequest, LLMResponse } from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ BE-SPECIFIC TYPES ============

export interface EndpointSpec {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requestBody?: TypeSpec;
  responseBody?: TypeSpec;
  queryParams?: ParamSpec[];
  pathParams?: ParamSpec[];
  authentication?: 'required' | 'optional' | 'none';
  rateLimit?: { requests: number; window: string };
}

export interface TypeSpec {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    optional?: boolean;
    description?: string;
  }>;
}

export interface ParamSpec {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  validation?: string;
}

export interface ServiceSpec {
  name: string;
  description: string;
  methods: Array<{
    name: string;
    params: string;
    returns: string;
    description: string;
  }>;
  dependencies?: string[];
}

export interface PrismaQuerySpec {
  model: string;
  operation:
    | 'findUnique'
    | 'findMany'
    | 'create'
    | 'update'
    | 'delete'
    | 'upsert';
  where?: Record<string, unknown>;
  include?: string[];
  orderBy?: string;
  pagination?: boolean;
}

export interface APIContract {
  name: string;
  version: string;
  basePath: string;
  endpoints: EndpointSpec[];
  types: TypeSpec[];
}

export interface GeneratedBackendCode {
  filename: string;
  content: string;
  type: 'route' | 'service' | 'middleware' | 'schema' | 'types';
}

// ============ BE AGENT PROMPTS ============

const BE_ENDPOINT_PROMPT = `You are generating a Fastify route handler with TypeScript.

Requirements:
- Use Fastify with TypeScript
- Include Zod validation for request body/params
- Add proper error handling with status codes
- Use Prisma for database operations
- Include authentication checks if required
- Add JSDoc documentation

Generate the full route handler including:
1. Imports (fastify, zod, prisma)
2. Zod schemas for validation
3. Route handler function
4. Export

Output ONLY the code wrapped in a code block with the language tag.`;

const BE_SERVICE_PROMPT = `You are generating a TypeScript service class.

Requirements:
- Use TypeScript with strict types
- Include proper error handling
- Use dependency injection pattern
- Add JSDoc documentation
- Follow SOLID principles

Generate the service including:
1. Imports
2. TypeScript interface for service
3. Service class implementation
4. Export

Output ONLY the code wrapped in a code block with the language tag.`;

const BE_PRISMA_PROMPT = `You are generating Prisma database queries.

Requirements:
- Use Prisma Client
- Include proper typing
- Handle relations efficiently
- Add pagination where needed
- Use transactions for multi-step operations

Output ONLY the code wrapped in a code block with the language tag.`;

const BE_CONTRACT_PROMPT = `You are creating an API contract document.

Requirements:
- Define clear endpoint specifications
- Include request/response types
- Document all parameters
- Specify authentication requirements
- Include example payloads

Output as a TypeScript file with types and contract object.`;

// ============ BACKEND DEVELOPER AGENT ============

export class BackendDeveloperAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.BACKEND_DEV, {
      systemPrompt: getAgentPrompt(AgentType.BACKEND_DEV),
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'backend_dev',
    });
  }

  // ============ API ENDPOINT GENERATION ============

  /**
   * Generate a Fastify route handler
   */
  async generateEndpoint(spec: EndpointSpec): Promise<GeneratedBackendCode> {
    this.updateProgress(
      10,
      `Generating endpoint: ${spec.method} ${spec.path}...`,
    );

    const requestBodyDesc = spec.requestBody
      ? `Request Body (${spec.requestBody.name}):\n${spec.requestBody.fields
          .map(
            (f) =>
              `  - ${f.name}: ${f.type}${f.optional ? '?' : ''} - ${f.description || ''}`,
          )
          .join('\n')}`
      : 'No request body';

    const responseBodyDesc = spec.responseBody
      ? `Response (${spec.responseBody.name}):\n${spec.responseBody.fields
          .map((f) => `  - ${f.name}: ${f.type}${f.optional ? '?' : ''}`)
          .join('\n')}`
      : 'No structured response';

    const paramsDesc =
      [
        ...(spec.pathParams || []).map(
          (p) => `Path: ${p.name} (${p.type}) - ${p.description || ''}`,
        ),
        ...(spec.queryParams || []).map(
          (p) => `Query: ${p.name} (${p.type}) - ${p.description || ''}`,
        ),
      ].join('\n') || 'No parameters';

    const response = await this.callLLM({
      systemPrompt: BE_ENDPOINT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a Fastify route handler with these specifications:

Endpoint: ${spec.method} ${spec.path}
Description: ${spec.description}

${requestBodyDesc}

${responseBodyDesc}

Parameters:
${paramsDesc}

Authentication: ${spec.authentication || 'none'}
${spec.rateLimit ? `Rate Limit: ${spec.rateLimit.requests} requests per ${spec.rateLimit.window}` : ''}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
    });

    this.updateProgress(100, `Endpoint ${spec.path} generated`);

    const filename = this.pathToFilename(spec.path);
    return {
      filename: `${filename}.ts`,
      content: this.extractCode(response.content),
      type: 'route',
    };
  }

  /**
   * Generate multiple endpoints for a resource (CRUD)
   */
  async generateCRUDEndpoints(
    resource: string,
    modelName: string,
    fields: TypeSpec['fields'],
  ): Promise<GeneratedBackendCode[]> {
    const endpoints: GeneratedBackendCode[] = [];
    const basePath = `/api/v1/${resource.toLowerCase()}s`;

    const specs: EndpointSpec[] = [
      {
        path: basePath,
        method: 'GET',
        description: `List all ${resource}s with pagination`,
        queryParams: [
          {
            name: 'page',
            type: 'number',
            required: false,
            description: 'Page number',
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Items per page',
          },
        ],
        responseBody: {
          name: `${modelName}List`,
          fields: [
            { name: 'data', type: `${modelName}[]` },
            { name: 'total', type: 'number' },
            { name: 'page', type: 'number' },
          ],
        },
        authentication: 'required',
      },
      {
        path: `${basePath}/:id`,
        method: 'GET',
        description: `Get a single ${resource} by ID`,
        pathParams: [{ name: 'id', type: 'string', required: true }],
        responseBody: { name: modelName, fields },
        authentication: 'required',
      },
      {
        path: basePath,
        method: 'POST',
        description: `Create a new ${resource}`,
        requestBody: {
          name: `Create${modelName}Dto`,
          fields: fields.filter(
            (f) => f.name !== 'id' && f.name !== 'createdAt',
          ),
        },
        responseBody: { name: modelName, fields },
        authentication: 'required',
      },
      {
        path: `${basePath}/:id`,
        method: 'PUT',
        description: `Update a ${resource}`,
        pathParams: [{ name: 'id', type: 'string', required: true }],
        requestBody: {
          name: `Update${modelName}Dto`,
          fields: fields
            .filter((f) => f.name !== 'id')
            .map((f) => ({ ...f, optional: true })),
        },
        responseBody: { name: modelName, fields },
        authentication: 'required',
      },
      {
        path: `${basePath}/:id`,
        method: 'DELETE',
        description: `Delete a ${resource}`,
        pathParams: [{ name: 'id', type: 'string', required: true }],
        authentication: 'required',
      },
    ];

    for (let i = 0; i < specs.length; i++) {
      this.updateProgress(
        Math.round((i / specs.length) * 100),
        `Generating ${specs[i].method} endpoint...`,
      );
      const endpoint = await this.generateEndpoint(specs[i]);
      endpoints.push(endpoint);
    }

    // Generate index file
    endpoints.push({
      filename: 'index.ts',
      content: this.generateRouteIndex(resource, specs),
      type: 'route',
    });

    return endpoints;
  }

  // ============ BUSINESS LOGIC ============

  /**
   * Generate a service class
   */
  async generateService(spec: ServiceSpec): Promise<GeneratedBackendCode> {
    this.updateProgress(10, `Generating service: ${spec.name}...`);

    const methodsDesc = spec.methods
      .map((m) => `- ${m.name}(${m.params}): ${m.returns} - ${m.description}`)
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: BE_SERVICE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a TypeScript service with these specifications:

Name: ${spec.name}
Description: ${spec.description}

Methods:
${methodsDesc}

Dependencies: ${spec.dependencies?.join(', ') || 'None'}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 3000,
    });

    this.updateProgress(100, `Service ${spec.name} generated`);

    return {
      filename: `${this.toKebabCase(spec.name)}.ts`,
      content: this.extractCode(response.content),
      type: 'service',
    };
  }

  /**
   * Generate data transformation utilities
   */
  async generateTransformers(
    inputType: TypeSpec,
    outputType: TypeSpec,
  ): Promise<GeneratedBackendCode> {
    const response = await this.callLLM({
      systemPrompt:
        'Generate TypeScript data transformation functions. Include proper types and error handling.',
      messages: [
        {
          role: 'user',
          content: `Generate transformers between these types:

Input: ${inputType.name}
${inputType.fields.map((f) => `  - ${f.name}: ${f.type}`).join('\n')}

Output: ${outputType.name}
${outputType.fields.map((f) => `  - ${f.name}: ${f.type}`).join('\n')}

Create functions:
1. ${inputType.name}To${outputType.name}
2. ${outputType.name}To${inputType.name} (if applicable)
3. Array versions of both`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return {
      filename: `${this.toKebabCase(inputType.name)}-transformer.ts`,
      content: this.extractCode(response.content),
      type: 'service',
    };
  }

  // ============ DATABASE INTEGRATION ============

  /**
   * Generate Prisma queries
   */
  async generatePrismaQueries(
    specs: PrismaQuerySpec[],
  ): Promise<GeneratedBackendCode> {
    this.updateProgress(10, 'Generating Prisma queries...');

    const queryDescriptions = specs
      .map(
        (spec) =>
          `- ${spec.operation} on ${spec.model}${spec.include ? ` with relations: ${spec.include.join(', ')}` : ''}${spec.pagination ? ' (paginated)' : ''}`,
      )
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: BE_PRISMA_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate Prisma query functions for:

${queryDescriptions}

Include:
- Proper TypeScript types
- Error handling
- Transaction support where needed
- Efficient relation loading`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2500,
    });

    this.updateProgress(100, 'Prisma queries generated');

    return {
      filename: `${specs[0].model.toLowerCase()}-repository.ts`,
      content: this.extractCode(response.content),
      type: 'service',
    };
  }

  /**
   * Generate a transaction handler
   */
  async generateTransaction(
    operations: Array<{
      model: string;
      operation: string;
      description: string;
    }>,
  ): Promise<GeneratedBackendCode> {
    const response = await this.callLLM({
      systemPrompt: BE_PRISMA_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a Prisma transaction that performs these operations:

${operations.map((op, i) => `${i + 1}. ${op.operation} on ${op.model}: ${op.description}`).join('\n')}

Include:
- Proper error handling with rollback
- TypeScript types
- Logging for debugging`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    return {
      filename: 'transaction.ts',
      content: this.extractCode(response.content),
      type: 'service',
    };
  }

  // ============ API CONTRACT ============

  /**
   * Generate an API contract for frontend consumption
   */
  async generateAPIContract(
    name: string,
    endpoints: EndpointSpec[],
  ): Promise<APIContract> {
    this.updateProgress(10, 'Generating API contract...');

    // Extract unique types
    const types: TypeSpec[] = [];
    for (const endpoint of endpoints) {
      if (
        endpoint.requestBody &&
        !types.find((t) => t.name === endpoint.requestBody!.name)
      ) {
        types.push(endpoint.requestBody);
      }
      if (
        endpoint.responseBody &&
        !types.find((t) => t.name === endpoint.responseBody!.name)
      ) {
        types.push(endpoint.responseBody);
      }
    }

    this.updateProgress(100, 'API contract generated');

    return {
      name,
      version: '1.0.0',
      basePath: '/api/v1',
      endpoints,
      types,
    };
  }

  /**
   * Generate TypeScript types from API contract
   */
  async generateContractTypes(
    contract: APIContract,
  ): Promise<GeneratedBackendCode> {
    const response = await this.callLLM({
      systemPrompt: BE_CONTRACT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate TypeScript types for this API contract:

API: ${contract.name} v${contract.version}
Base Path: ${contract.basePath}

Endpoints:
${contract.endpoints.map((e) => `- ${e.method} ${e.path}: ${e.description}`).join('\n')}

Types:
${contract.types.map((t) => `${t.name}: { ${t.fields.map((f) => `${f.name}: ${f.type}`).join(', ')} }`).join('\n')}

Generate:
1. Request/Response types
2. API path constants
3. Endpoint configuration object`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    return {
      filename: `${this.toKebabCase(contract.name)}-contract.ts`,
      content: this.extractCode(response.content),
      type: 'types',
    };
  }

  // ============ MIDDLEWARE ============

  /**
   * Generate authentication middleware
   */
  async generateAuthMiddleware(options: {
    strategy: 'jwt' | 'session' | 'api-key';
    optional?: boolean;
  }): Promise<GeneratedBackendCode> {
    const response = await this.callLLM({
      systemPrompt: BE_ENDPOINT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate Fastify authentication middleware:

Strategy: ${options.strategy}
Optional: ${options.optional ? 'Yes (continue if not authenticated)' : 'No (reject if not authenticated)'}

Include:
- Token/session validation
- User object attachment to request
- Proper error responses
- TypeScript types`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return {
      filename: 'auth-middleware.ts',
      content: this.extractCode(response.content),
      type: 'middleware',
    };
  }

  /**
   * Generate validation middleware
   */
  async generateValidationMiddleware(
    schema: TypeSpec,
  ): Promise<GeneratedBackendCode> {
    const response = await this.callLLM({
      systemPrompt: BE_ENDPOINT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate Zod validation schema and middleware for:

Type: ${schema.name}
Fields:
${schema.fields.map((f) => `  - ${f.name}: ${f.type}${f.optional ? ' (optional)' : ''}`).join('\n')}

Include:
- Zod schema with proper types
- Fastify preValidation hook
- Error formatting`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return {
      filename: `${this.toKebabCase(schema.name)}-validation.ts`,
      content: this.extractCode(response.content),
      type: 'middleware',
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
   * Convert path to filename
   */
  private pathToFilename(path: string): string {
    return (
      path
        .replace(/^\/api\/v\d+\//, '')
        .replace(/\/:(\w+)/g, '-by-$1')
        .replace(/\//g, '-')
        .replace(/^-|-$/g, '') || 'route'
    );
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

  /**
   * Generate route index file
   */
  private generateRouteIndex(resource: string, specs: EndpointSpec[]): string {
    const routeImports = specs
      .map(
        (_, i) =>
          `import route${i} from './${this.pathToFilename(specs[i].path)}';`,
      )
      .join('\n');

    return `import { FastifyInstance } from 'fastify';

${routeImports}

export async function register${this.toPascalCase(resource)}Routes(app: FastifyInstance) {
${specs.map((s, i) => `  app.register(route${i});`).join('\n')}
}
`;
  }

  /**
   * Convert to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }
}
