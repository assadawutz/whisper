import type { WorkspaceSnapshot } from "../workspace/vfsTypes";

export type EditInstruction = {
  path: string;
  language:
    | "javascript"
    | "typescript"
    | "json"
    | "markdown"
    | "text"
    | "css"
    | "html"
    | "python"
    | "go"
    | "rust";
  newContent: string;
  reason?: string;
};

export type ProposedChange = {
  path: string;
  language: EditInstruction["language"];
  oldContent: string;
  newContent: string;
  diff?: string;
  impact?: "low" | "medium" | "high";
};

export type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
};

export type AgentToolCall = {
  toolName: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
};

export type AgentResult = {
  notes: string;
  edits: EditInstruction[];
  toolCalls?: AgentToolCall[];
  reasoning?: string[];
  confidence?: number;
  suggestions?: string[];
  warnings?: string[];
};

export type ReviewResult = {
  notes: string;
  edits: EditInstruction[];
  riskNotes?: string;
  riskLevel?: "low" | "medium" | "high" | "critical";
  blockers?: string[];
  improvements?: string[];
  approved?: boolean;
};

export type AgentContext = {
  goal: string;
  workspace: WorkspaceSnapshot;
  focusPaths: string[];
  availableTools?: AgentTool[];
  previousAttempts?: AgentResult[];
  constraints?: string[];
  preferences?: {
    maxEdits?: number;
    preferredLanguage?: string;
    testingRequired?: boolean;
    documentationRequired?: boolean;
  };
};

export type AgentStep = {
  step: number;
  action: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: unknown;
  error?: string;
  duration?: number;
};

export type MultiStepPlan = {
  id: string;
  goal: string;
  steps: AgentStep[];
  currentStep: number;
  status: "planning" | "executing" | "completed" | "failed";
  results: AgentResult[];
};

// Agent capabilities
export type AgentCapability = {
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, unknown>;
};

export type AgentProfile = {
  id: string;
  name: string;
  role:
    | "coder"
    | "reviewer"
    | "planner"
    | "tester"
    | "documenter"
    | "debugger"
    | "optimizer";
  capabilities: AgentCapability[];
  systemPrompt: string;
  temperature: number;
  model: string;
};
