/**
 * Database Engineer Agent - Designs schemas, optimizes queries, and manages migrations
 */

import { AgentType, LLMRequest, LLMResponse } from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ DB-SPECIFIC TYPES ============

export interface DataModelSpec {
  name: string;
  description: string;
  fields: FieldSpec[];
  relations?: RelationSpec[];
  indexes?: IndexSpec[];
}

export interface FieldSpec {
  name: string;
  type: PrismaFieldType;
  optional?: boolean;
  unique?: boolean;
  default?: string;
  description?: string;
}

export type PrismaFieldType =
  | 'String'
  | 'Int'
  | 'Float'
  | 'Boolean'
  | 'DateTime'
  | 'Json'
  | 'BigInt'
  | 'Decimal'
  | 'Bytes';

export interface RelationSpec {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  relatedModel: string;
  foreignKey?: string;
  onDelete?: 'Cascade' | 'SetNull' | 'Restrict' | 'NoAction';
}

export interface IndexSpec {
  fields: string[];
  unique?: boolean;
  name?: string;
}

export interface SchemaAnalysis {
  models: string[];
  relationships: Array<{ from: string; to: string; type: string }>;
  issues: Array<{
    model: string;
    issue: string;
    severity: 'warning' | 'error';
  }>;
  suggestions: string[];
}

export interface QueryAnalysis {
  query: string;
  estimatedCost: 'low' | 'medium' | 'high';
  issues: string[];
  suggestions: string[];
  optimizedQuery?: string;
}

export interface MigrationSpec {
  name: string;
  up: string;
  down: string;
  description: string;
}

export interface SeedDataSpec {
  model: string;
  count: number;
  relations?: Record<string, number>;
  customFields?: Record<string, string>;
}

// ============ DB AGENT PROMPTS ============

const DB_SCHEMA_PROMPT = `You are generating a Prisma schema model.

Requirements:
- Use proper Prisma syntax
- Include appropriate field types
- Add @id, @unique, @default as needed
- Define proper relations with @relation
- Add indexes with @@index
- Include timestamps (createdAt, updatedAt)

Output ONLY the Prisma model code (no code block markers).`;

const DB_MIGRATION_PROMPT = `You are generating Prisma migration SQL.

Requirements:
- Generate both UP and DOWN migrations
- Use PostgreSQL syntax
- Handle data preservation
- Include proper constraints
- Be safe for production

Output SQL for both migrations.`;

const DB_QUERY_PROMPT = `You are analyzing and optimizing Prisma/SQL queries.

Requirements:
- Identify performance issues
- Suggest appropriate indexes
- Recommend query restructuring
- Consider N+1 problems
- Optimize relation loading

Provide detailed analysis and suggestions.`;

const DB_SEED_PROMPT = `You are generating realistic seed data.

Requirements:
- Use Faker.js patterns for realistic data
- Maintain referential integrity
- Create meaningful relationships
- Support TypeScript with Prisma

Output ONLY the TypeScript code wrapped in a code block.`;

// ============ DATABASE ENGINEER AGENT ============

export class DatabaseEngineerAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.ARCHITECT, {
      // Using Architect type as there's no DB type
      systemPrompt: `You are a Database Engineer specialized in:
- Schema design and normalization
- Query optimization and indexing
- Prisma ORM for PostgreSQL
- Migration strategies
- Data modeling best practices

Always prioritize data integrity, performance, and scalability.`,
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'database_engineer',
    });
  }

  // ============ SCHEMA DESIGN ============

  /**
   * Generate Prisma schema from data requirements
   */
  async generateSchema(models: DataModelSpec[]): Promise<string> {
    this.updateProgress(10, 'Generating Prisma schema...');

    const modelDescriptions = models
      .map((model) => {
        const fields = model.fields
          .map(
            (f) =>
              `  - ${f.name}: ${f.type}${f.optional ? '?' : ''}${f.unique ? ' (unique)' : ''}${f.default ? ` = ${f.default}` : ''}`,
          )
          .join('\n');

        const relations =
          model.relations
            ?.map(
              (r) =>
                `  - ${r.name}: ${r.type} to ${r.relatedModel}${r.onDelete ? ` (onDelete: ${r.onDelete})` : ''}`,
            )
            .join('\n') || 'None';

        const indexes =
          model.indexes
            ?.map(
              (i) =>
                `  - [${i.fields.join(', ')}]${i.unique ? ' (unique)' : ''}`,
            )
            .join('\n') || 'None';

        return `
Model: ${model.name}
Description: ${model.description}
Fields:
${fields}
Relations:
${relations}
Indexes:
${indexes}`;
      })
      .join('\n\n---\n');

    const response = await this.callLLM({
      systemPrompt: DB_SCHEMA_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a Prisma schema with these models:\n\n${modelDescriptions}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Schema generated');
    return response.content;
  }

  /**
   * Parse data requirements and suggest schema
   */
  async parseDataRequirements(requirements: string): Promise<DataModelSpec[]> {
    this.updateProgress(10, 'Analyzing data requirements...');

    const response = await this.callLLM({
      systemPrompt: `Analyze data requirements and extract models.
Return JSON array with: name, description, fields (name, type, optional, unique, default), relations (name, type, relatedModel), indexes.`,
      messages: [{ role: 'user', content: requirements }],
      temperature: 0.3,
      maxTokens: 2000,
    });

    this.updateProgress(100, 'Requirements analyzed');
    return this.parseJSON<DataModelSpec[]>(response.content);
  }

  /**
   * Analyze existing schema for issues
   */
  async analyzeSchema(schema: string): Promise<SchemaAnalysis> {
    this.updateProgress(10, 'Analyzing schema...');

    const response = await this.callLLM({
      systemPrompt: `Analyze Prisma schema for issues and improvements.
Return JSON: { models: string[], relationships: [{from, to, type}], issues: [{model, issue, severity}], suggestions: string[] }`,
      messages: [
        { role: 'user', content: `Analyze this Prisma schema:\n\n${schema}` },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    this.updateProgress(100, 'Analysis complete');
    return this.parseJSON<SchemaAnalysis>(response.content);
  }

  /**
   * Add indexes to schema based on query patterns
   */
  async suggestIndexes(
    schema: string,
    queryPatterns: string[],
  ): Promise<IndexSpec[]> {
    const response = await this.callLLM({
      systemPrompt: `Based on query patterns, suggest database indexes.
Return JSON array: [{ fields: string[], unique?: boolean, name?: string }]`,
      messages: [
        {
          role: 'user',
          content: `Schema:\n${schema}\n\nQuery patterns:\n${queryPatterns.join('\n')}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 1000,
    });

    return this.parseJSON<IndexSpec[]>(response.content);
  }

  // ============ MIGRATION GENERATION ============

  /**
   * Generate migration from schema diff
   */
  async generateMigration(
    currentSchema: string,
    newSchema: string,
    migrationName: string,
  ): Promise<MigrationSpec> {
    this.updateProgress(10, 'Detecting schema changes...');

    const response = await this.callLLM({
      systemPrompt: DB_MIGRATION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate migration from current to new schema.

Current Schema:
${currentSchema}

New Schema:
${newSchema}

Migration name: ${migrationName}

Provide:
1. Description of changes
2. UP migration SQL
3. DOWN migration SQL (to rollback)`,
        },
      ],
      temperature: 0.2,
      maxTokens: 2000,
    });

    this.updateProgress(100, 'Migration generated');

    // Parse the response
    const upMatch = response.content.match(/UP[:\s]*```sql\n?([\s\S]*?)```/i);
    const downMatch = response.content.match(
      /DOWN[:\s]*```sql\n?([\s\S]*?)```/i,
    );
    const descMatch = response.content.match(
      /Description[:\s]*(.*?)(?=UP|$)/is,
    );

    return {
      name: migrationName,
      up: upMatch?.[1]?.trim() || response.content,
      down: downMatch?.[1]?.trim() || '-- No rollback generated',
      description: descMatch?.[1]?.trim() || 'Schema migration',
    };
  }

  /**
   * Generate Prisma migration file content
   */
  async generatePrismaMigration(
    changes: Array<{
      type: 'add' | 'remove' | 'modify';
      model: string;
      details: string;
    }>,
  ): Promise<string> {
    const changeList = changes
      .map((c) => `${c.type.toUpperCase()} ${c.model}: ${c.details}`)
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: 'Generate Prisma migration SQL for these changes.',
      messages: [{ role: 'user', content: changeList }],
      temperature: 0.2,
      maxTokens: 1500,
    });

    return this.extractCode(response.content);
  }

  // ============ QUERY OPTIMIZATION ============

  /**
   * Analyze and optimize a query
   */
  async optimizeQuery(query: string, context?: string): Promise<QueryAnalysis> {
    this.updateProgress(10, 'Analyzing query...');

    const response = await this.callLLM({
      systemPrompt: DB_QUERY_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze and optimize this Prisma query:

\`\`\`typescript
${query}
\`\`\`

${context ? `Context: ${context}` : ''}

Provide:
1. Estimated performance cost (low/medium/high)
2. Issues identified
3. Suggestions for improvement
4. Optimized version of the query

Return as JSON: { query, estimatedCost, issues: string[], suggestions: string[], optimizedQuery?: string }`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    this.updateProgress(100, 'Query analyzed');
    return this.parseJSON<QueryAnalysis>(response.content);
  }

  /**
   * Detect N+1 query problems
   */
  async detectN1Problems(code: string): Promise<
    Array<{
      location: string;
      issue: string;
      fix: string;
    }>
  > {
    const response = await this.callLLM({
      systemPrompt:
        'Detect N+1 query problems in Prisma code. Return JSON array: [{ location, issue, fix }]',
      messages: [{ role: 'user', content: code }],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return this.parseJSON(response.content);
  }

  /**
   * Generate optimized query with includes
   */
  async generateOptimizedQuery(
    model: string,
    requirements: string,
  ): Promise<string> {
    const response = await this.callLLM({
      systemPrompt:
        'Generate an optimized Prisma query with proper includes and selects.',
      messages: [
        {
          role: 'user',
          content: `Model: ${model}\nRequirements: ${requirements}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    return this.extractCode(response.content);
  }

  // ============ SEED DATA GENERATION ============

  /**
   * Generate seed data script
   */
  async generateSeedScript(specs: SeedDataSpec[]): Promise<string> {
    this.updateProgress(10, 'Generating seed data...');

    const seedDescriptions = specs
      .map(
        (spec) =>
          `${spec.model}: ${spec.count} records${spec.relations ? `, with relations to ${Object.keys(spec.relations).join(', ')}` : ''}`,
      )
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: DB_SEED_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a Prisma seed script with:

${seedDescriptions}

Use Faker.js for realistic data.
Include proper async/await and error handling.
Handle relationship constraints.`,
        },
      ],
      temperature: 0.5,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Seed script generated');
    return this.extractCode(response.content);
  }

  /**
   * Generate realistic test data for a model
   */
  async generateTestData(
    model: string,
    fields: FieldSpec[],
    count: number,
  ): Promise<Record<string, unknown>[]> {
    const fieldList = fields.map((f) => `${f.name}: ${f.type}`).join(', ');

    const response = await this.callLLM({
      systemPrompt: `Generate ${count} realistic test records as JSON array.`,
      messages: [
        {
          role: 'user',
          content: `Model: ${model}\nFields: ${fieldList}\nCount: ${count}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return this.parseJSON(response.content);
  }

  // ============ HELPERS ============

  /**
   * Extract code from markdown code blocks
   */
  private extractCode(content: string): string {
    const codeBlockMatch = content.match(
      /```(?:sql|typescript|ts|prisma)?\n?([\s\S]*?)```/,
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
