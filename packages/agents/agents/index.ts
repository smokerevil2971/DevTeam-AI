/**
 * Agents Module - Exports all agent implementations
 */

export {
  ProjectManagerAgent,
  TaskBreakdown,
  ProjectSummary,
  ClarifyingQuestion,
  StatusUpdate,
} from './project-manager';

export {
  FrontendDeveloperAgent,
  ComponentSpec,
  PropSpec,
  PageSpec,
  APIHookSpec,
  StateStoreSpec,
  GeneratedCode,
} from './frontend-dev';

export {
  BackendDeveloperAgent,
  EndpointSpec,
  TypeSpec,
  ParamSpec,
  ServiceSpec,
  PrismaQuerySpec,
  APIContract,
  GeneratedBackendCode,
} from './backend-dev';

export {
  DatabaseEngineerAgent,
  DataModelSpec,
  FieldSpec,
  PrismaFieldType,
  RelationSpec,
  IndexSpec,
  SchemaAnalysis,
  QueryAnalysis,
  MigrationSpec,
  SeedDataSpec,
} from './database-engineer';

export {
  SecurityEngineerAgent,
  VulnerabilityReport,
  SecurityFinding,
  AuthConfigSpec,
  SecurityHeaderSpec,
  GeneratedSecurityCode,
} from './security-engineer';

export {
  QAEngineerAgent,
  TestSuiteSpec,
  TestCase,
  GeneratedTest,
  CoverageReport,
  TestPlan,
} from './qa-engineer';

export {
  DevOpsEngineerAgent,
  DockerSpec,
  CICDSpec,
  ComposeSpec,
  K8sSpec,
  GeneratedConfig,
} from './devops-engineer';

export {
  AIMLSpecialistAgent,
  RAGConfigSpec,
  PromptTemplateSpec,
  AIFeatureSpec,
  GeneratedAICode,
} from './ai-specialist';

export { AgentCoordinator, coordinator } from '../orchestration/coordinator';
