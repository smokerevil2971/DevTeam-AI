/**
 * DevOps Engineer Agent - Manages infrastructure, CI/CD, and deployment
 */

import { AgentType, LLMRequest, LLMResponse } from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ DEVOPS-SPECIFIC TYPES ============

export interface DockerSpec {
  serviceName: string;
  type: 'node' | 'python' | 'go' | 'static';
  baseImage?: string;
  ports: number[];
  envVars?: string[];
  buildArgs?: string[];
  multiStage?: boolean;
}

export interface CICDSpec {
  platform: 'github-actions' | 'gitlab-ci' | 'jenkins';
  triggers: {
    push?: string[];
    pullRequest?: string[];
    schedule?: string;
  };
  stages: Array<'lint' | 'test' | 'build' | 'deploy'>;
  environment?: Record<string, string>;
}

export interface ComposeSpec {
  services: Array<{
    name: string;
    image?: string;
    build?: string;
    ports?: string[];
    environment?: Record<string, string>;
    volumes?: string[];
    dependsOn?: string[];
  }>;
  networks?: string[];
  volumes?: string[];
}

export interface K8sSpec {
  name: string;
  replicas: number;
  image: string;
  port: number;
  env?: Record<string, string>;
  resources?: {
    cpu: string;
    memory: string;
  };
}

export interface GeneratedConfig {
  filename: string;
  content: string;
  type: 'docker' | 'ci' | 'k8s' | 'compose';
}

// ============ DEVOPS AGENT PROMPTS ============

const DEVOPS_DOCKER_PROMPT = `You are a DevOps Engineer creating a Dockerfile.

Requirements:
- Use official verified base images
- Implement multi-stage builds for smaller images
- Follow security best practices (non-root user)
- Optimize layer caching
- Handle init process correctly (tini/dumb-init)

Generate the complete Dockerfile.
Output ONLY the code wrapped in a code block.`;

const DEVOPS_CI_PROMPT = `You are designing a CI/CD pipeline.

Requirements:
- Define clear stages (lint, test, build, deploy)
- Cache dependencies for speed
- Fail fast on errors
- Handle secrets securely
- Support parallel execution where possible

Generate the complete pipeline configuration.
Output ONLY the code wrapped in a code block.`;

const DEVOPS_COMPOSE_PROMPT = `You are creating a Docker Compose configuration.

Requirements:
- Define all necessary services
- Configure networking
- Persist data with volumes
- Set environment variables
- Handle dependency usage (depends_on)

Generate the complete docker-compose.yml.
Output ONLY the code wrapped in a code block.`;

// ============ DEVOPS ENGINEER AGENT ============

export class DevOpsEngineerAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.DEVOPS, {
      systemPrompt: getAgentPrompt(AgentType.DEVOPS),
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'devops',
    });
  }

  // ============ DOCKER GENERATION ============

  /**
   * Generate Dockerfile for a service
   */
  async generateDockerfile(spec: DockerSpec): Promise<GeneratedConfig> {
    this.updateProgress(10, `Generating Dockerfile for ${spec.serviceName}...`);

    const response = await this.callLLM({
      systemPrompt: DEVOPS_DOCKER_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate Dockerfile for:
Type: ${spec.type}
Service: ${spec.serviceName}
Ports: ${spec.ports.join(', ')}
${spec.baseImage ? `Base Image: ${spec.baseImage}` : ''}
${spec.multiStage ? 'Use multi-stage build' : ''}
Env Vars: ${spec.envVars?.join(', ') || 'None'}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 2000,
    });

    this.updateProgress(100, 'Dockerfile generated');

    return {
      filename: 'Dockerfile',
      content: this.extractCode(response.content),
      type: 'docker',
    };
  }

  /**
   * Generate Docker Compose configuration
   */
  async generateCompose(spec: ComposeSpec): Promise<GeneratedConfig> {
    this.updateProgress(10, 'Generating docker-compose.yml...');

    const servicesDesc = spec.services
      .map((s) => `- ${s.name}: ${s.image || s.build} (${s.ports?.join(', ')})`)
      .join('\n');

    const response = await this.callLLM({
      systemPrompt: DEVOPS_COMPOSE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate docker-compose.yml with:

Services:
${servicesDesc}

Networks: ${spec.networks?.join(', ') || 'default'}
Volumes: ${spec.volumes?.join(', ') || 'none'}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Compose file generated');

    return {
      filename: 'docker-compose.yml',
      content: this.extractCode(response.content),
      type: 'compose',
    };
  }

  // ============ CI/CD GENERATION ============

  /**
   * Generate CI/CD pipeline configuration
   */
  async generatePipeline(spec: CICDSpec): Promise<GeneratedConfig> {
    this.updateProgress(10, `Generating ${spec.platform} pipeline...`);

    const response = await this.callLLM({
      systemPrompt: DEVOPS_CI_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate ${spec.platform} configuration.

Triggers:
${JSON.stringify(spec.triggers, null, 2)}

Stages: ${spec.stages.join(', ')}

Environment:
${JSON.stringify(spec.environment || {}, null, 2)}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    this.updateProgress(100, 'Pipeline generated');

    let filename = '';
    switch (spec.platform) {
      case 'github-actions':
        filename = '.github/workflows/main.yml';
        break;
      case 'gitlab-ci':
        filename = '.gitlab-ci.yml';
        break;
      case 'jenkins':
        filename = 'Jenkinsfile';
        break;
    }

    return {
      filename,
      content: this.extractCode(response.content),
      type: 'ci',
    };
  }

  // ============ KUBERNETES GENERATION ============

  /**
   * Generate Kubernetes manifests
   */
  async generateK8sManifests(spec: K8sSpec): Promise<GeneratedConfig[]> {
    this.updateProgress(10, `Generating K8s manifests for ${spec.name}...`);

    const response = await this.callLLM({
      systemPrompt: 'Generate Kubernetes manifests (Deployment, Service).',
      messages: [
        {
          role: 'user',
          content: `Service: ${spec.name}
Image: ${spec.image}
Replicas: ${spec.replicas}
Port: ${spec.port}
Resources: ${JSON.stringify(spec.resources)}
Env: ${JSON.stringify(spec.env)}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 3000,
    });

    const content = this.extractCode(response.content);

    // Split combined yaml if needed
    if (content.includes('---')) {
      return content.split('---').map((part, i) => ({
        filename: `${spec.name}-${i === 0 ? 'deployment' : 'service'}.yaml`,
        content: part.trim(),
        type: 'k8s',
      }));
    }

    return [
      {
        filename: `${spec.name}.yaml`,
        content,
        type: 'k8s',
      },
    ];
  }

  // ============ HELPERS ============

  /**
   * Extract code from markdown code blocks
   */
  private extractCode(content: string): string {
    const codeBlockMatch = content.match(
      /```(?:yaml|dockerfile|groovy)?\n?([\s\S]*?)```/,
    );
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    return content.trim();
  }
}
