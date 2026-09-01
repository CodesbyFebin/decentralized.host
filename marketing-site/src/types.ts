export type ClaimStatus = 'IMPLEMENTED' | 'EXPERIMENTAL' | 'PLANNED';

export type ContentType = 
  | 'homepage'
  | 'pillar'
  | 'cluster'
  | 'feature'
  | 'architecture'
  | 'security'
  | 'documentation'
  | 'guide'
  | 'comparison'
  | 'deploy-recipe'
  | 'depin'
  | 'roadmap'
  | 'about';

export type AudienceType = 'developers' | 'devops' | 'system-architects' | 'node-operators' | 'engineering-leads';

export interface PageFrontmatter {
  id: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  intent: string;
  primaryEntity: string;
  secondaryEntities: string[];
  contentType: ContentType;
  audience: AudienceType;
  claimStatus: ClaimStatus;
  sources: string[];
  relatedPages: string[];
  canonical: string;
  schemaTypes: string[];
  publishedAt: string;
  updatedAt: string;
  extractableAnswer?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  slug: string;
  category: 'deployment' | 'compute-mesh' | 'routing' | 'security' | 'developer-tools' | 'economics';
  claimStatus: ClaimStatus;
  summary: string;
  codeSource: string;
  description: string;
  technicalCapabilities: string[];
  cliCommand?: string;
}

export interface CompetitorComparison {
  id: string;
  name: string;
  slug: string;
  officialUrl: string;
  license: string;
  deploymentModel: string;
  runtime: string;
  multiServerSupport: string;
  gitDeployment: string;
  cliTool: string;
  dashboard: string;
  dockerSupport: string;
  composeSupport: string;
  automaticTls: string;
  databaseTemplates: string;
  rollbackSupport: string;
  observability: string;
  decentralizedOrMesh: string;
  lastVerifiedAt: string;
  evidenceSource: string;
  summaryComparison: string;
}

export interface DeployRecipe {
  id: string;
  name: string;
  slug: string;
  category: 'web-framework' | 'backend-api' | 'static-site' | 'database' | 'bot-worker';
  runtime: string;
  dockerfileSnippet: string;
  prerequisites: string[];
  steps: string[];
  claimStatus: ClaimStatus;
  autoDetectFiles: string[];
}

export interface GuideItem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeMinutes: number;
  prerequisites: string[];
  architectureOverview: string;
  steps: {
    title: string;
    description: string;
    command?: string;
    output?: string;
    codeSnippet?: string;
  }[];
  troubleshooting: { issue: string; resolution: string }[];
  securityConsiderations: string[];
  claimStatus: ClaimStatus;
}

export interface FeatureComparisonRow {
  featureName: string;
  category: string;
  description: string;
  decentralizedHost: {
    status: 'Supported' | 'Limited' | 'Not Supported';
    detail: string;
    claimStatus: ClaimStatus;
  };
  coolify: {
    status: 'Supported' | 'Limited' | 'Not Supported';
    detail: string;
  };
  dokploy: {
    status: 'Supported' | 'Limited' | 'Not Supported';
    detail: string;
  };
  lastVerifiedAt: string;
  evidenceSource: string;
}

