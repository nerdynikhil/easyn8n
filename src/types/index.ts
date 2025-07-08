import { User, Workflow, Template, UsageLog } from '@prisma/client';

// Extended user type with plan information
export interface ExtendedUser extends User {
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  _count?: {
    workflows: number;
    usageLogs: number;
  };
}

// Workflow with relations
export interface WorkflowWithUser extends Workflow {
  user: User;
}

// Template with usage statistics
export interface TemplateWithStats extends Template {
  _count?: {
    usageLogs: number;
  };
}

// n8n workflow structure (simplified)
export interface N8NWorkflow {
  id?: string;
  name: string;
  nodes: N8NNode[];
  connections: N8NConnections;
  active: boolean;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhook?: Record<string, any>;
}

export interface N8NConnections {
  [key: string]: {
    main?: Array<Array<{ node: string; type: string; index: number }>>;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Workflow generation request
export interface WorkflowGenerationRequest {
  description: string;
  complexity?: 'simple' | 'medium' | 'complex';
  category?: string;
  requirements?: string[];
}

// Template categories
export type TemplateCategory = 
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'hr'
  | 'development'
  | 'ecommerce'
  | 'social-media'
  | 'data-processing'
  | 'communication'
  | 'other';

// User plan limits
export interface PlanLimits {
  workflowsPerMonth: number;
  templatesAccess: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  customTemplates: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    workflowsPerMonth: 3,
    templatesAccess: false,
    prioritySupport: false,
    apiAccess: false,
    customTemplates: false,
  },
  pro: {
    workflowsPerMonth: 50,
    templatesAccess: true,
    prioritySupport: false,
    apiAccess: false,
    customTemplates: true,
  },
  business: {
    workflowsPerMonth: -1, // unlimited
    templatesAccess: true,
    prioritySupport: true,
    apiAccess: true,
    customTemplates: true,
  },
  enterprise: {
    workflowsPerMonth: -1, // unlimited
    templatesAccess: true,
    prioritySupport: true,
    apiAccess: true,
    customTemplates: true,
  },
};

// Usage tracking types
export type UsageAction = 
  | 'workflow_generated'
  | 'workflow_exported'
  | 'template_used'
  | 'template_customized'
  | 'api_call'
  | 'workflow_shared';

export interface UsageMetadata {
  generationTime?: number;
  nodeCount?: number;
  complexity?: string;
  source?: string;
  [key: string]: any;
} 