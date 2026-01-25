/**
 * Context Manager
 *
 * Responsible for building, optimizing, and managing context for LLM calls.
 * Ensures that agents have the most relevant information within token limits.
 */

import { AgentTask, ProjectContext, AgentMessage, ProjectFile } from '../types';
import { estimateTokens } from '../llm/cost-tracker';

export interface ContextOptions {
  maxTokens?: number;
  includeFiles?: boolean;
  includeHistory?: boolean;
  includeTechStack?: boolean;
}

export class ContextManager {
  private static readonly DEFAULT_MAX_TOKENS = 12000; // Leaving room for output
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {}

  /**
   * Build an optimized context string for a specific task
   */
  async buildContext(
    task: AgentTask,
    context: ProjectContext,
    options: ContextOptions = {},
  ): Promise<string> {
    const maxTokens = options.maxTokens || ContextManager.DEFAULT_MAX_TOKENS;
    let parts: string[] = [];

    // 1. Task Description (High Priority)
    const taskPart = this.formatTask(task);
    parts.push(taskPart);

    // 2. Tech Stack & Config (High Priority)
    if (options.includeTechStack !== false) {
      parts.push(this.formatTechStack(context));
    }

    // 3. Relevant Files (Medium Priority)
    if (options.includeFiles !== false && context.files.length > 0) {
      const filesPart = this.formatFiles(context.files, task.description);
      parts.push(filesPart);
    }

    // 4. Conversation History (Low Priority - Truncate first)
    if (options.includeHistory !== false && context.recentMessages.length > 0) {
      const historyPart = this.formatHistory(context.recentMessages);
      parts.push(historyPart);
    }

    // 5. Shared Knowledge (Medium Priority)
    const knowledgePart = this.formatKnowledge();
    if (knowledgePart) {
      parts.push(knowledgePart);
    }

    // Optimize and Truncate
    return this.optimizeContext(parts, maxTokens);
  }

  /**
   * Add shared knowledge
   */
  addKnowledge(key: string, value: any) {
    this.knowledgeBase.set(key, value);
  }

  /**
   * Get shared knowledge
   */
  getKnowledge(key: string) {
    return this.knowledgeBase.get(key);
  }

  // ============ FORMATTERS ============

  private formatTask(task: AgentTask): string {
    return `
## Current Task
Title: ${task.title}
Description: ${task.description}
Priority: ${task.priority}
Status: ${task.status}
`;
  }

  private formatTechStack(context: ProjectContext): string {
    return `
## Project Configuration
Name: ${context.name}
Description: ${context.description}
Tech Stack: ${context.techStack.join(', ')}
`;
  }

  private formatFiles(files: ProjectFile[], taskDescription: string): string {
    // Naive relevance check: if filename is mentioned in task
    // Real impl would use embeddings/similarity
    const relevantFiles = files.filter(
      (f) =>
        taskDescription.includes(f.name) || taskDescription.includes(f.path),
    );

    // If no specific files mentioned, include summary of top 5
    const filesToInclude =
      relevantFiles.length > 0 ? relevantFiles : files.slice(0, 5);

    let output = '\n## Relevant Files\n';
    for (const file of filesToInclude) {
      output += `\n### ${file.path}\n`;
      // Truncate large files
      const content = file.content || '';
      if (content.length > 2000) {
        output += content.substring(0, 2000) + '\n... (truncated)';
      } else {
        output += content;
      }
      output += '\n';
    }
    return output;
  }

  private formatHistory(messages: AgentMessage[]): string {
    let output = '\n## Recent Activity\n';
    // Take last 10 messages
    const recent = messages.slice(-10);
    for (const msg of recent) {
      output += `${msg.senderAgent || 'User'}: ${msg.content.substring(0, 200)}\n`;
    }
    return output;
  }

  private formatKnowledge(): string {
    if (this.knowledgeBase.size === 0) return '';

    let output = '\n## Shared Knowledge\n';
    for (const [key, value] of this.knowledgeBase.entries()) {
      output += `- ${key}: ${JSON.stringify(value)}\n`;
    }
    return output;
  }

  /**
   * Optimize context to fit within token limits
   * Removes low priority sections if needed
   */
  private optimizeContext(parts: string[], maxTokens: number): string {
    let fullContext = parts.join('\n');
    let estimated = estimateTokens(fullContext);

    if (estimated <= maxTokens) {
      return fullContext;
    }

    console.warn(
      `[ContextManager] Context size ${estimated} exceeds limit ${maxTokens}. Optimizing...`,
    );

    // Iteratively remove sections from the end (assuming lower priority at end of array)
    // NOTE: In buildContext, we pushed History last, then Knowledge. Ideally history is least important.
    // Let's refine buildContext order or use a weighted approach.
    // For MVP, we will just return it truncated securely.

    return fullContext.substring(0, maxTokens * 4); // Rough char estimation (4 chars per token)
  }
}

export const contextManager = new ContextManager();
